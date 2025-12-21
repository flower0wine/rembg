import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateToken } from "@/lib/utils/jwt";

export async function GET() {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Get user subscription
    const { data: subscription, error: subError } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (subError) {
      console.error("Subscription fetch error:", subError);
      return NextResponse.json(
        { error: "Failed to fetch subscription" },
        { status: 500 },
      );
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email!,
      plan: subscription.plan,
      usageCount: subscription.usage_count,
      maxUsageLimit: subscription.max_usage_limit,
      maxFileSizeMb: subscription.max_file_size_mb,
      maxBatchSize: subscription.max_batch_size,
      hasApiAccess: subscription.has_api_access,
    });

    return NextResponse.json({
      subscription: {
        userId: user.id,
        email: user.email!,
        plan: subscription.plan,
        usageCount: subscription.usage_count,
        maxUsageLimit: subscription.max_usage_limit,
        maxFileSizeMb: subscription.max_file_size_mb,
        maxBatchSize: subscription.max_batch_size,
        hasApiAccess: subscription.has_api_access,
      },
      token,
    });
  }
  catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
