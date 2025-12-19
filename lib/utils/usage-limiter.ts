import type { Database, UsageRecordInsert } from "../supabase/types";
import type { UsageLimitResult } from "../types";
import { createClient } from "../supabase/server";

/**
 * Maximum number of free processing requests for guest users
 */
const GUEST_FREE_LIMIT = 1;

/**
 * Check if a user (authenticated or guest) can process an image
 *
 * For authenticated users: unlimited processing
 * For guest users: limited to GUEST_FREE_LIMIT (1) free processing
 *
 * @param fingerprint - Browser fingerprint for guest users
 * @param userId - User ID for authenticated users (optional)
 * @returns UsageLimitResult indicating if processing is allowed
 */
export async function checkUsageLimit(
  fingerprint: string,
  userId?: string | null,
): Promise<UsageLimitResult> {
  const supabase = await createClient();

  // Authenticated users have unlimited access
  if (userId) {
    return {
      canProcess: true,
      remainingCount: -1, // -1 indicates unlimited
      requiresLogin: false,
      message: "Unlimited processing for authenticated users",
    };
  }

  // For guest users, check fingerprint-based usage
  try {
    const { data, error } = await supabase
      .from("usage_records")
      .select("id")
      .eq("fingerprint", fingerprint)
      .is("user_id", null);

    if (error) {
      console.error("Error checking usage limit:", error);
      // On error, allow processing but log the issue
      return {
        canProcess: true,
        remainingCount: 0,
        requiresLogin: false,
        message: "Error checking usage limit, allowing request",
      };
    }

    const usageCount = data?.length || 0;
    const remaining = Math.max(0, GUEST_FREE_LIMIT - usageCount);
    const canProcess = usageCount < GUEST_FREE_LIMIT;

    return {
      canProcess,
      remainingCount: remaining,
      requiresLogin: !canProcess,
      message: canProcess
        ? `${remaining} free processing${remaining === 1 ? "" : "s"} remaining`
        : "Free limit reached. Please login to continue.",
    };
  }
  catch (error) {
    console.error("Exception checking usage limit:", error);
    // On exception, allow processing but log the issue
    return {
      canProcess: true,
      remainingCount: 0,
      requiresLogin: false,
      message: "Error checking usage limit, allowing request",
    };
  }
}

/**
 * Record a usage event for tracking
 * This should be called after successful image processing
 *
 * @param fingerprint - Browser fingerprint for guest users
 * @param userId - User ID for authenticated users (optional)
 * @returns true if recording was successful, false otherwise
 */
export async function recordUsage(
  fingerprint: string,
  userId?: string | null,
): Promise<boolean> {
  const supabase = await createClient();

  try {
    const record = {
      user_id: userId || null,
      fingerprint: userId ? null : fingerprint,
    };

    // Type assertion needed due to Supabase type inference limitations
    const { error } = await (supabase
      .from("usage_records")
      .insert(record as any));

    if (error) {
      console.error("Error recording usage:", error);
      return false;
    }

    return true;
  }
  catch (error) {
    console.error("Exception recording usage:", error);
    return false;
  }
}

/**
 * Get current usage count for a user or fingerprint
 *
 * @param fingerprint - Browser fingerprint for guest users
 * @param userId - User ID for authenticated users (optional)
 * @returns The number of times this user/fingerprint has used the service
 */
export async function getUsageCount(
  fingerprint: string,
  userId?: string | null,
): Promise<number> {
  const supabase = await createClient();

  try {
    let query = supabase
      .from("usage_records")
      .select("id", { count: "exact", head: true });

    if (userId) {
      query = query.eq("user_id", userId);
    }
    else {
      query = query.eq("fingerprint", fingerprint).is("user_id", null);
    }

    const { count, error } = await query;

    if (error) {
      console.error("Error getting usage count:", error);
      return 0;
    }

    return count || 0;
  }
  catch (error) {
    console.error("Exception getting usage count:", error);
    return 0;
  }
}
