import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkUsageLimit } from "@/lib/utils/usage-limiter.util";

/**
 * API route to check usage limits for a user or guest
 * This can be called before attempting to process an image
 *
 * POST /api/check-usage
 * Body: { fingerprint: string }
 *
 * Returns: UsageLimitResult
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fingerprint } = body;

    if (!fingerprint || typeof fingerprint !== "string") {
      return NextResponse.json(
        { error: "Fingerprint is required" },
        { status: 400 },
      );
    }

    // Get current user session
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Check usage limit
    const result = await checkUsageLimit(fingerprint, user?.id);

    return NextResponse.json(result);
  }
  catch (error) {
    console.error("Error in check-usage API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
