import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import dayjs from "dayjs";
import "server-only";

type SubscriptionPlan = Database["public"]["Enums"]["subscription_plan"];

/**
 * 获取 free 方案配置
 */
async function getFreePlanConfig(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("subscription_plans_config")
    .select("*")
    .eq("plan", "free")
    .maybeSingle();

  if (error || !data) {
    console.warn("Failed to fetch free plan config, using defaults:", error);
    throw new Error("我们这边出了一点问题，请稍后再试");
  }

  return data;
}

/**
 * 创建新的 free 订阅
 */
async function createFreeSubscription(
  supabase: SupabaseClient<Database>,
  userId: string
) {
  const config = await getFreePlanConfig(supabase);

  const { data, error } = await supabase
    .from("user_subscriptions")
    .insert({
      user_id: userId,
      plan: "free" as SubscriptionPlan,
      billing_period: "monthly",
      usage_count: 0,
      max_usage_limit: config.max_usage_limit,
      max_file_size_mb: config.max_file_size_mb,
      max_batch_size: config.max_batch_size,
      has_api_access: config.has_api_access,
      has_priority_support: config.has_priority_support,
      subscription_start_date: dayjs().toISOString(),
      subscription_end_date: dayjs().add(30, "month").toISOString(),
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create subscription:", error);
    return { data: null, error };
  }

  console.log(`Created free subscription for user ${userId}`);
  return { data, error: null };
}

/**
 * 检查用户订阅状态，如果不存在则创建默认的 free 订阅
 * @param supabase - Supabase 客户端实例
 * @param userId - 用户 ID
 * @returns 用户订阅信息或错误
 */
export async function ensureUserSubscription(
  supabase: SupabaseClient<Database>,
  userId: string
) {
  try {
    // 检查用户是否已有订阅
    const { data: existingSubscription, error: fetchError } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    // 如果已存在订阅，直接返回
    if (existingSubscription && !fetchError) {
      return { data: existingSubscription, error: null };
    }

    // 如果不存在订阅，创建默认的 free 订阅
    return await createFreeSubscription(supabase, userId);
  }
  catch (error) {
    console.error("Error in ensureUserSubscription:", error);
    return { data: null, error };
  }
}

/**
 * 获取用户当前的订阅信息
 * @param supabase - Supabase 客户端实例
 * @param userId - 用户 ID
 * @returns 用户订阅信息或 null
 */
export async function getUserSubscription(
  supabase: SupabaseClient<Database>,
  userId: string
) {
  const { data, error } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Failed to fetch user subscription:", error);
    return null;
  }

  return data;
}
