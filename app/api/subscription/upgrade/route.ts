import type { TablesInsert } from "@/lib/supabase/database.types";
import dayjs from "dayjs";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlanLimits } from "@/lib/supabase/subscription-plans";

export async function POST(request: Request) {
  try {
    const { plan } = await request.json();

    if (!plan || !["free", "starter", "pro"].includes(plan)) {
      console.error("Invalid plan:", plan);
      return NextResponse.json(
        { error: "Invalid plan" },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Unauthorized:", authError);
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Fetch plan limits from database (single source of truth)
    const limits = await getPlanLimits(plan);

    // Calculate end date (1 month for monthly billing)
    const endDate = dayjs().add(1, "month").toISOString();

    const upsertData: TablesInsert<"user_subscriptions"> = {
      user_id: user.id,
      plan,
      ...limits,
      is_active: true,
      subscription_start_date: dayjs().toISOString(),
      subscription_end_date: endDate,
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
      console.error("Failed to create subscription:", subError);
      return NextResponse.json(
        { error: "Failed to create subscription" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
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
