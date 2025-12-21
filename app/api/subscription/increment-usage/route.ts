import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyToken } from "@/lib/utils/jwt";

export async function POST(request: Request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Missing authorization token" },
        { status: 401 },
      );
    }

    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 },
      );
    }

    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user || user.id !== payload.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Get current subscription
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

    // Check if user has reached limit
    if (
      subscription.max_usage_limit !== null
      && subscription.usage_count >= subscription.max_usage_limit
    ) {
      return NextResponse.json(
        {
          error: "Usage limit reached",
          canProcess: false,
          remainingCount: 0,
        },
        { status: 403 },
      );
    }

    // Increment usage count
    const { data: updated, error: updateError } = await supabase
      .from("user_subscriptions")
      .update({
        usage_count: subscription.usage_count + 1,
      })
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Usage increment error:", updateError);
      return NextResponse.json(
        { error: "Failed to update usage" },
        { status: 500 },
      );
    }

    const remainingCount = updated.max_usage_limit !== null
      ? updated.max_usage_limit - updated.usage_count
      : -1; // -1 means unlimited

    return NextResponse.json({
      success: true,
      usageCount: updated.usage_count,
      remainingCount,
      canProcess: remainingCount !== 0,
    });
  }
  catch (error) {
    console.error("Increment usage error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
