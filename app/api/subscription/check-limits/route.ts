import type { Tables } from "@/lib/supabase/database.types";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyToken } from "@/lib/utils/jwt";

export async function POST(request: Request) {
  try {
    const { fileSize, batchSize = 1 } = await request.json();

    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Missing authorization token" },
        { status: 401 },
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 },
      );
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user || user.id !== payload.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { data: subscription, error: subError } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (subError || !subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 },
      );
    }

    const sub = subscription as Tables<"user_subscriptions">;

    if (sub.max_usage_limit !== null && sub.usage_count >= sub.max_usage_limit) {
      return NextResponse.json(
        {
          canProcess: false,
          error: "Usage limit reached",
          message: `您已达到 ${sub.plan} 方案的使用限制`,
          remainingCount: 0,
        },
        { status: 403 },
      );
    }

    const fileSizeMB = fileSize / (1024 * 1024);
    if (fileSizeMB > sub.max_file_size_mb) {
      return NextResponse.json(
        {
          canProcess: false,
          error: "File size exceeds limit",
          message: `文件大小超过 ${sub.max_file_size_mb}MB 限制`,
          maxFileSizeMb: sub.max_file_size_mb,
        },
        { status: 403 },
      );
    }

    if (batchSize > sub.max_batch_size) {
      return NextResponse.json(
        {
          canProcess: false,
          error: "Batch size exceeds limit",
          message: `批处理数量超过 ${sub.max_batch_size} 的限制`,
          maxBatchSize: sub.max_batch_size,
        },
        { status: 403 },
      );
    }

    const remainingCount = sub.max_usage_limit !== null
      ? sub.max_usage_limit - sub.usage_count
      : -1;

    return NextResponse.json({
      canProcess: true,
      remainingCount,
      maxFileSizeMb: sub.max_file_size_mb,
      maxBatchSize: sub.max_batch_size,
      plan: sub.plan,
    });
  }
  catch (error) {
    console.error("Check limits error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
