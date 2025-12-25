import type { SubscriptionPlan } from "../types";
import type { Tables } from "./database.types";
import { createClient } from "./server";
import "server-only";

/**
 * Get all visible subscription plans (for pricing page)
 */
export async function getVisiblePlans(): Promise<Tables<"subscription_plans_config">[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("subscription_plans_config")
    .select("*")
    .eq("is_visible", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching subscription plans:", error);
    return [];
  }

  return data || [];
}

/**
 * Get specific plan configuration
 */
export async function getPlanConfig(plan: SubscriptionPlan): Promise<Tables<"subscription_plans_config"> | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("subscription_plans_config")
    .select("*")
    .eq("plan", plan)
    .single();

  if (error) {
    console.error(`Error fetching plan config for ${plan}:`, error);
    return null;
  }

  return data;
}

/**
 * Get plan limits for subscription creation/update
 */
export async function getPlanLimits(plan: SubscriptionPlan) {
  const config = await getPlanConfig(plan);

  if (!config) {
    throw new Error(`Plan configuration not found: ${plan}`);
  }

  return {
    max_usage_limit: config.max_usage_limit,
    max_file_size_mb: config.max_file_size_mb,
    max_batch_size: config.max_batch_size,
    has_api_access: config.has_api_access,
    has_priority_support: config.has_priority_support,
  };
}
