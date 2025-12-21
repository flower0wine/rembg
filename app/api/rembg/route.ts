import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureUserSubscription } from "@/lib/supabase/subscription";

export async function POST(request: NextRequest) {
  let reservationId: string | null = null;
  let userId: string | null = null;

  try {
    // 1. 验证用户身份
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "未授权：请先登录" },
        { status: 401 }
      );
    }

    userId = user.id;

    // 2. 获取或创建用户订阅
    const { data: subscription, error: subError } = await ensureUserSubscription(
      supabase,
      user.id
    );

    if (subError || !subscription) {
      console.error("订阅检查失败:", subError);
      return NextResponse.json(
        { error: "无法获取订阅信息" },
        { status: 500 }
      );
    }

    // 3. 检查订阅是否激活
    if (!subscription.is_active) {
      return NextResponse.json(
        { error: "订阅已过期，请续费" },
        { status: 403 }
      );
    }

    // 4. 预留使用额度（原子性操作，防止超额）
    const { data: reservation, error: reserveError } = await (supabase as any)
      .rpc("reserve_usage_quota", {
        p_user_id: user.id,
        p_timeout_seconds: 300  // 5分钟超时
      });

    if (reserveError) {
      console.error("预留额度失败:", reserveError);

      if (reserveError.message?.includes('quota_exceeded')) {
        return NextResponse.json(
          {
            error: "已达到使用额度上限",
            usage_count: subscription.usage_count,
            max_usage_limit: subscription.max_usage_limit,
            plan: subscription.plan
          },
          { status: 429 }
        );
      }

      if (reserveError.message?.includes('subscription_inactive')) {
        return NextResponse.json(
          { error: "订阅已过期，请续费" },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: "无法预留额度" },
        { status: 500 }
      );
    }

    if (!reservation || reservation.length === 0) {
      return NextResponse.json(
        { error: "预留额度失败" },
        { status: 500 }
      );
    }

    // 保存预留ID，用于后续确认或释放
    reservationId = reservation[0].reservation_id;

    // 5. 获取环境变量中的服务 URL
    const webUrl = process.env.REMBG_SERVICE_URL;

    if (!webUrl) {
      // 释放预留
      if (reservationId) {
        await (supabase as any).rpc("release_usage_reservation", {
          p_reservation_id: reservationId,
          p_user_id: user.id
        });
      }
      return NextResponse.json(
        { error: "服务配置错误：未设置 REMBG_SERVICE_URL" },
        { status: 500 }
      );
    }

    // 6. 获取请求体中的图片数据
    const imageData = await request.arrayBuffer();

    if (!imageData || imageData.byteLength === 0) {
      // 释放预留
      if (reservationId) {
        await (supabase as any).rpc("release_usage_reservation", {
          p_reservation_id: reservationId,
          p_user_id: user.id
        });
      }
      return NextResponse.json(
        { error: "未提供图片数据" },
        { status: 400 }
      );
    }

    // 7. 检查文件大小限制
    const fileSizeMB = imageData.byteLength / (1024 * 1024);
    if (fileSizeMB > subscription.max_file_size_mb) {
      // 释放预留
      if (reservationId) {
        await (supabase as any).rpc("release_usage_reservation", {
          p_reservation_id: reservationId,
          p_user_id: user.id
        });
      }
      return NextResponse.json(
        {
          error: `文件大小超出限制`,
          file_size_mb: fileSizeMB.toFixed(2),
          max_file_size_mb: subscription.max_file_size_mb,
          plan: subscription.plan
        },
        { status: 413 }
      );
    }

    // 8. 调用云端服务
    const response = await fetch(webUrl, {
      method: "POST",
      headers: {
        "Content-Type": "image/jpeg",
      },
      body: imageData,
    });

    // 处理响应
    if (response.status === 400) {
      // 释放预留
      if (reservationId) {
        await (supabase as any).rpc("release_usage_reservation", {
          p_reservation_id: reservationId,
          p_user_id: user.id
        });
      }
      return NextResponse.json(
        { error: "图片未提供或格式不正确" },
        { status: 400 }
      );
    }

    if (!response.ok) {
      // 释放预留
      if (reservationId) {
        await (supabase as any).rpc("release_usage_reservation", {
          p_reservation_id: reservationId,
          p_user_id: user.id
        });
      }
      return NextResponse.json(
        { error: `服务错误：${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    // 9. 获取处理后的图片数据
    const processedImageData = await response.arrayBuffer();

    // 10. 处理成功，确认预留并增加计数
    const { data: confirmed, error: confirmError } = await (supabase as any)
      .rpc("confirm_usage_reservation", {
        p_reservation_id: reservationId,
        p_user_id: user.id
      });

    if (confirmError) {
      console.error("确认使用失败:", confirmError);
      // 即使确认失败，也返回处理后的图片（用户已经消耗了资源）
      // 但记录错误以便后续修复
    }

    const newUsageCount = confirmed?.[0]?.new_usage_count || subscription.usage_count + 1;

    // 11. 返回处理后的图片，并在响应头中包含使用情况
    return new NextResponse(processedImageData, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
        "X-Usage-Count": String(newUsageCount),
        "X-Usage-Limit": String(subscription.max_usage_limit),
        "X-Usage-Remaining": String(subscription.max_usage_limit - newUsageCount),
      },
    });
  }
  catch (error) {
    console.error("背景移除服务错误:", error);

    // 如果有预留ID，尝试释放
    if (reservationId && userId) {
      try {
        const supabase = await createClient();
        await (supabase as any).rpc("release_usage_reservation", {
          p_reservation_id: reservationId,
          p_user_id: userId
        });
      } catch (releaseError) {
        console.error("释放预留失败:", releaseError);
      }
    }

    return NextResponse.json(
      { error: "处理图片时发生错误" },
      { status: 500 }
    );
  }
}
