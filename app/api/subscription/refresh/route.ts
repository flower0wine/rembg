import type { Tables } from "@/lib/supabase/database.types";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateToken, verifyToken } from "@/lib/utils/jwt";

export async function POST(request: Request) {
  try {
    const { token: oldToken } = await request.json();

    if (!oldToken) {
      return NextResponse.json(
        { error: "Missing token" },
        { status: 400 },
      );
    }

    // Try to decode the token (even if expired)
    const payload = verifyToken(oldToken);

    // Get authenticated user from Supabase
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized - please login again" },
        { status: 401 },
      );
    }

    // If token is valid and user matches, just verify user still exists
    if (payload && payload.userId === user.id) {
      // Fetch fresh subscription data
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

      // Generate new token
      const newToken = generateToken({
        userId: user.id,
        email: user.email!,
        plan: sub.plan,
        usageCount: sub.usage_count,
        maxUsageLimit: sub.max_usage_limit,
        maxFileSizeMb: sub.max_file_size_mb,
        maxBatchSize: sub.max_batch_size,
        hasApiAccess: sub.has_api_access,
      });

      return NextResponse.json({
        success: true,
        token: newToken,
        subscription: sub,
      });
    }

    // Token is invalid or user mismatch
    return NextResponse.json(
      { error: "Invalid token - please login again" },
      { status: 401 },
    );
  }
  catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
