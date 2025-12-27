import type { Tables } from "@/lib/supabase/database.types";
import type { ApiResponse } from "@/lib/types/http";
import api from "../axios";

interface SubscriptionStatusResponse {
  subscription: Tables<"user_subscriptions">;
}

interface UpgradeSubscriptionParams {
  plan: string;
  billingPeriod?: string;
}

interface UpgradeSubscriptionResponse {
  success: boolean;
  subscription: Tables<"user_subscriptions">;
}

/**
 * 获取订阅状态
 * @returns 订阅信息和token
 */
export async function getSubscriptionStatus() {
  return api.get<SubscriptionStatusResponse>("/subscription/status");
}

/**
 * 升级订阅
 * @param params 订阅计划和计费周期
 * @returns 升级结果
 */
export async function upgradeSubscription(
  params: UpgradeSubscriptionParams
) {
  return api.post<ApiResponse<UpgradeSubscriptionResponse>>(
    "/subscription/upgrade",
    params
  );
}
