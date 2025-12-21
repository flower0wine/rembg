import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureUserSubscription } from "@/lib/supabase/subscription";

/**
 * POST /api/subscription/initialize
 * 手动初始化用户订阅（如果不存在）
 */
export async function POST() {
  try {
    const supabase = await createClient();

    // 获取当前用户
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "未授权访问" },
        { status: 401 }
      );
    }

    // 确保用户有订阅
    const { data: subscription, error: subscriptionError }
      = await ensureUserSubscription(supabase, user.id);

    if (subscriptionError) {
      console.error("Failed to initialize subscription:", subscriptionError);
      return NextResponse.json(
        { error: "初始化订阅失败" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      subscription,
    });
  }
  catch (error) {
    console.error("Error in subscription initialization:", error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/subscription/initialize
 * 获取当前用户的订阅状态
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // 获取当前用户
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "未授权访问" },
        { status: 401 }
      );
    }

    // 获取用户订阅
    const { data: subscription, error: subscriptionError } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (subscriptionError) {
      console.error("Failed to fetch subscription:", subscriptionError);
      return NextResponse.json(
        { error: "获取订阅信息失败" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      subscription,
      hasSubscription: !!subscription,
    });
  }
  catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}
