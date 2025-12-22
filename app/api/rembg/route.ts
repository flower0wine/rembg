import type { NextRequest } from "next/server";
import { validateTurnstileToken } from "next-turnstile";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureUserSubscription } from "@/lib/supabase/subscription";

// 处理历史记录接口
interface ProcessingHistoryData {
  userId: string;
  originalFilename: string;
  fileSize: number;
  originalImageUrl: string;
  processedImageUrl: string;
}

// 异步记录处理历史
async function recordProcessingHistory(
  supabase: any,
  data: ProcessingHistoryData
): Promise<void> {
  try {
    const { error } = await supabase
      .from("processing_history")
      .insert({
        user_id: data.userId,
        original_filename: data.originalFilename,
        file_size: data.fileSize,
        original_image_url: data.originalImageUrl,
        processed_image_url: data.processedImageUrl,
      });

    if (error) {
      throw error;
    }
  }
  catch (error) {
    // 重新抛出错误，让调用方决定如何处理
    throw new Error(`记录处理历史失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function POST(request: NextRequest) {
  let reservationId: string | null = null;
  let userId: string | null = null;

  try {
    // 1. 验证 Turnstile token
    const turnstileToken = request.headers.get("X-Turnstile-Token");

    if (!turnstileToken) {
      return NextResponse.json(
        { error: "缺少机器人验证" },
        { status: 400 }
      );
    }

    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;

    if (!turnstileSecret) {
      console.error("未配置 TURNSTILE_SECRET_KEY");
      return NextResponse.json(
        { error: "服务配置错误" },
        { status: 500 }
      );
    }

    const result = await validateTurnstileToken({
      token: turnstileToken,
      secretKey: turnstileSecret,
      sandbox: process.env.NODE_ENV === "development",
      remoteip: request.headers.get("x-forwarded-for") || undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "机器人验证失败，请重试" },
        { status: 403 }
      );
    }

    // 2. 验证用户身份
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "未授权：请先登录" },
        { status: 401 }
      );
    }

    userId = user.id;

    // 3. 获取或创建用户订阅
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

    // 4. 检查订阅是否激活
    if (!subscription.is_active) {
      return NextResponse.json(
        { error: "订阅已过期，请续费" },
        { status: 403 }
      );
    }

    // 5. 预留使用额度（原子性操作，防止超额）
    const { data: reservation, error: reserveError } = await (supabase as any)
      .rpc("reserve_usage_quota", {
        p_user_id: user.id,
        p_timeout_seconds: 300 // 5分钟超时
      });

    if (reserveError) {
      console.error("预留额度失败:", reserveError);

      if (reserveError.message?.includes("quota_exceeded")) {
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

      if (reserveError.message?.includes("subscription_inactive")) {
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

    // 6. 获取环境变量中的服务 URL
    const webUrl = process.env.REMBG_SERVICE_URL;

    if (!webUrl) {
      // 释放预留
      if (reservationId) {
        await supabase.rpc("release_usage_reservation", {
          p_reservation_id: reservationId,
          p_user_id: user.id
        });
      }
      return NextResponse.json(
        { error: "服务配置错误：未设置 REMBG_SERVICE_URL" },
        { status: 500 }
      );
    }

    // 7. 获取请求体中的图片数据
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

    // 8. 检查文件大小限制
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

    // 9. 调用云端服务
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
        { error: "我们这边出了一点问题，请稍后再试" },
        { status: response.status }
      );
    }

    // 10. 获取处理后的图片数据
    const processedImageData = await response.arrayBuffer();

    // 11. 处理成功，确认预留并增加计数
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

    // 12. 异步记录处理历史（不阻塞响应）
    const originalFilename = request.headers.get("X-Original-Filename") || "image.jpg";

    // 使用 Promise 异步记录，不等待结果
    recordProcessingHistory(supabase, {
      userId: user.id,
      originalFilename,
      fileSize: imageData.byteLength,
      // 注意：这里我们暂时不存储实际的图片URL，因为我们直接返回图片数据
      // 如果需要存储图片，需要先上传到 Supabase Storage
      originalImageUrl: "", // 可以后续实现图片存储
      processedImageUrl: "", // 可以后续实现图片存储
    }).catch((error) => {
      // 历史记录失败不影响主流程，只记录错误
      console.error("记录处理历史失败:", error);
    });

    // 13. 返回处理后的图片，并在响应头中包含使用情况
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
      }
      catch (releaseError) {
        console.error("释放预留失败:", releaseError);
      }
    }

    return NextResponse.json(
      { error: "处理图片时发生错误" },
      { status: 500 }
    );
  }
}
