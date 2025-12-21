import type { Tables, TablesInsert, TablesUpdate } from "@/lib/supabase/database.types";
import type { BillingPeriod, SubscriptionPlan } from "@/lib/types";
import dayjs from "dayjs";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlanLimits } from "@/lib/supabase/subscription-plans";
import { generateToken } from "@/lib/utils/jwt";

export async function POST(request: Request) {
  try {
    const { plan, billingPeriod } = await request.json();

    if (!plan
      || !["free", "pro", "enterprise"].includes(plan)
      || !billingPeriod
      || !["monthly", "annual"].includes(billingPeriod)
    ) {
      return NextResponse.json(
        { error: "Invalid plan" },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Fetch plan limits from database (single source of truth)
    const limits = await getPlanLimits(plan as SubscriptionPlan);

    // Calculate end date based on billing period
    const endDate = billingPeriod === "annual"
      ? dayjs().add(1, "year").toISOString()
      : dayjs().add(1, "month").toISOString();

    const upsertData: TablesInsert<"user_subscriptions"> = {
      user_id: user.id,
      plan: plan as SubscriptionPlan,
      billing_period: billingPeriod as BillingPeriod,
      ...limits,
      is_active: true,
      subscription_start_date: dayjs().toISOString(),
      subscription_end_date: endDate
    };

    const { data: subscription, error: subError } = await supabase
      .from("user_subscriptions")
      .upsert(upsertData, {
        onConflict: "user_id",
      })
      .select()
      .single();

    if (subError) {
      console.error("Subscription update error:", subError);
      return NextResponse.json(
        { error: "Failed to update subscription" },
        { status: 500 },
      );
    }

    if (!subscription) {
      return NextResponse.json(
        { error: "Failed to create subscription" },
        { status: 500 },
      );
    }

    const sub = subscription as Tables<"user_subscriptions">;

    const token = generateToken({
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
      token,
    });
  }
  catch (error) {
    console.error("Upgrade error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
