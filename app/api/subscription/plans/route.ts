import { NextResponse } from "next/server";
import { getVisiblePlans } from "@/lib/supabase/subscription-plans";

/**
 * GET /api/subscription/plans
 * Returns all visible subscription plans for pricing page
 */
export async function GET() {
  try {
    const plans = await getVisiblePlans();

    return NextResponse.json({
      success: true,
      plans,
    });
  }
  catch (error) {
    console.error("Error fetching subscription plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription plans" },
      { status: 500 },
    );
  }
}
