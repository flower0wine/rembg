import type { NextRequest } from "next/server";
import dayjs from "dayjs";
import { validateTurnstileToken } from "next-turnstile";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { uploadImageToR2 } from "@/lib/request/api/storage";
import { createProcessingHistory, updateProcessingHistory } from "@/lib/supabase/history";
import { createClient } from "@/lib/supabase/server";
import { ensureUserSubscription } from "@/lib/supabase/subscription";
import { toError } from "@/lib/utils";
import { getFileExtension } from "@/lib/utils/file";

const turnstileSecret = process.env.TURNSTILE_SECRET_KEY!;
const rembgServiceUrl = process.env.REMBG_SERVICE_URL!;

if (!rembgServiceUrl) {
  throw new Error("REMBG_SERVICE_URL 环境变量未配置");
}

export async function POST(request: NextRequest) {
  let reservationId: string | null = null;
  let userId: string | null = null;
  let historyId: string | null = null;
  const startTime = dayjs();

  const originalFilename = request.headers.get("X-Original-Filename");
  const contentType = request.headers.get("Content-Type");

  const fileSize = request.headers.get("X-Original-File-Size");

  if (!fileSize || isNaN(Number(fileSize))) {
    return NextResponse.json(
      { error: "请提供文件大小" },
      { status: 400 }
    );
  }

  const originalFileSize = Number(fileSize);

  if (!originalFilename || !contentType) {
    return NextResponse.json(
      { error: "请提供文件名" },
      { status: 400 }
    );
  }

  const fileExtension = getFileExtension(originalFilename);

  if (!["jpg", "jpeg", "png", "webp"].includes(fileExtension)) {
    return NextResponse.json(
      { error: "不支持的文件类型" },
      { status: 400 }
    );
  }

  if (!request.body) {
    return NextResponse.json(
      { error: "未提供图片数据" },
      { status: 400 }
    );
  }

  try {
    // 验证 Turnstile token
    const turnstileToken = request.headers.get("X-Turnstile-Token");

    if (!turnstileToken) {
      return NextResponse.json(
        { error: "验证失败" },
        { status: 400 }
      );
    }

    if (!turnstileSecret) {
      console.error("未配置 TURNSTILE_SECRET_KEY");
      return NextResponse.json(
        { error: "服务配置错误" },
        { status: 500 }
      );
    }

    const userIp = request.headers.get("x-forwarded-for") || undefined;

    const result = await validateTurnstileToken({
      token: turnstileToken,
      secretKey: turnstileSecret,
      sandbox: process.env.NODE_ENV === "development",
      remoteip: userIp,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "验证失败，请重试" },
        { status: 403 }
      );
    }

    // 验证用户身份
    const supabase = await createClient();
    const { data, error: authError } = await supabase.auth.getClaims();

    const user = data?.claims;

    if (authError || !user) {
      return NextResponse.json(
        { error: "未授权：请先登录" },
        { status: 401 }
      );
    }

    userId = user.sub;

    // 获取或创建用户订阅
    const { data: subscription, error: subError } = await ensureUserSubscription(
      supabase,
      userId
    );

    if (subError || !subscription) {
      console.error("订阅检查失败:", subError);
      return NextResponse.json(
        { error: "无法获取订阅信息" },
        { status: 500 }
      );
    }

    // 检查订阅是否过期（基于时间判断）
    const now = dayjs();
    const subscriptionEnd = dayjs(subscription.subscription_end_date);
    const isExpired = now.isAfter(subscriptionEnd);

    // 如果订阅已过期但 is_active 仍为 true，更新状态
    if (isExpired && subscription.is_active) {
      await supabase
        .from("user_subscriptions")
        .update({ is_active: false })
        .eq("user_id", userId);

      subscription.is_active = false;
    }

    // 检查订阅是否激活
    if (!subscription.is_active || isExpired) {
      return NextResponse.json(
        { error: "订阅已过期，请续费" },
        { status: 403 }
      );
    }

    // 检查文件大小限制
    const fileSizeKB = originalFileSize / 1024;
    if (fileSizeKB > subscription.max_file_size_kb) {
      return NextResponse.json(
        {
          error: `文件大小超出限制`,
          file_size_kb: fileSizeKB.toFixed(2),
          max_file_size_kb: subscription.max_file_size_kb,
          plan: subscription.plan,
        },
        { status: 413 },
      );
    }

    // 预留使用额度（原子性操作，防止超额）
    const { data: reservation, error: reserveError } = await supabase
      .rpc("reserve_usage_quota", {
        p_user_id: userId,
        p_timeout_seconds: 300 // 5分钟超时
      });

    if (reserveError) {
      console.error("[rembg] 预留额度失败:", reserveError);

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

    const [processStream, uploadStream] = request.body.tee();

    // 上传未处理的图片到R2存储
    let originalImageUrl = "";

    try {
      const originalUuid = uuidv4();
      const originalPath = `images/${userId}/original/${originalUuid}.${fileExtension}`;

      // 上传处理后的图片
      originalImageUrl = await uploadImageToR2(uploadStream, originalPath, "image/png");
    }
    catch (uploadError) {
      console.error("[rembg] 图片上传失败:", uploadError);
      // 上传失败不影响主流程，继续处理
    }

    // 创建处理历史记录
    try {
      historyId = await createProcessingHistory({
        user_id: userId,
        original_image_url: originalImageUrl,
        original_filename: originalFilename,
        processing_status: "processing",
      });
    }
    catch (historyError) {
      console.error("创建处理历史失败:", historyError);
      // 历史记录失败不影响主流程
    }

    // 用云端服务处理图片
    const response = await fetch(rembgServiceUrl, {
      method: "POST",
      headers: {
        "Content-Type": contentType,
      },
      body: processStream,
      // @ts-expect-error 该属性是真实存在的！！！
      duplex: "half",
    });

    if (response.status !== 200 || !response.body) {
      // 更新处理历史为失败
      if (historyId) {
        await updateProcessingHistory(historyId, {
          processing_status: "failed",
          error_message: `远程服务错误: HTTP ${response.status}`,
          processing_time_ms: dayjs().diff(startTime),
        }).catch(console.error);
      }

      // 释放预留
      await supabase.rpc("release_usage_reservation", {
        p_reservation_id: reservationId,
        p_user_id: userId
      });
      return NextResponse.json(
        { error: "我们这边出了一点问题，请稍后再试" },
        { status: response.status }
      );
    }

    // 上传处理后的图片到R2存储
    let processedImageUrl = "";

    try {
      const processedUuid = uuidv4();
      const processedPath = `images/${userId}/processed/${processedUuid}.png`;

      // 上传处理后的图片
      processedImageUrl = await uploadImageToR2(response.body, processedPath, "image/png");
    }
    catch (uploadError) {
      console.error("[rembg] 图片上传失败:", uploadError);
      // 上传失败不影响主流程，继续处理
    }

    // 处理成功，确认预留并增加计数
    const { data: confirmed, error: confirmError } = await supabase
      .rpc("confirm_usage_reservation", {
        p_reservation_id: reservationId,
        p_user_id: userId
      });

    if (confirmError) {
      console.error("[rembg] 确认使用失败:", confirmError);
      // 即使确认失败，也返回处理后的图片（用户已经消耗了资源）
      // 但记录错误以便后续修复
    }

    const newUsageCount = confirmed?.[0]?.new_usage_count || subscription.usage_count + 1;

    // 更新处理历史为成功
    if (historyId) {
      await updateProcessingHistory(historyId, {
        original_image_url: originalImageUrl,
        processed_image_url: processedImageUrl,
        processing_status: "completed",
        processing_time_ms: dayjs().diff(startTime),
      }).catch((error) => {
        console.error("[rembg] 更新处理历史失败:", error);
      });
    }

    // 14. 返回处理后的图片，并在响应头中包含使用情况
    return NextResponse.json({
      url: processedImageUrl,
      usage: {
        count: newUsageCount,
        limit: subscription.max_usage_limit,
        remaining: subscription.max_usage_limit - newUsageCount,
      },
    });
  }
  catch (error) {
    console.error("[rembg] 背景移除服务错误:", error);

    const err = toError(error);

    // 更新处理历史为失败
    if (historyId && userId) {
      try {
        await updateProcessingHistory(historyId, {
          processing_status: "failed",
          error_message: err.message,
          processing_time_ms: dayjs().diff(startTime),
        });
      }
      catch (historyError) {
        console.error("更新处理历史失败:", historyError);
      }
    }

    // 如果有预留ID，尝试释放
    if (reservationId && userId) {
      try {
        const supabase = await createClient();
        await supabase.rpc("release_usage_reservation", {
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
