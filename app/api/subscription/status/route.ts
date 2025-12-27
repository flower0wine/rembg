import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data, error: authError } = await supabase.auth.getClaims();

    const user = data?.claims;

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
      .eq("user_id", user.sub)
      .single();

    if (subError) {
      console.error("Subscription fetch error:", subError);
      return NextResponse.json(
        { error: "Failed to fetch subscription" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      subscription: {
        userId: user.sub,
        email: user.email!,
        ...subscription,
      },
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
