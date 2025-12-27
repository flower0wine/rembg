"use client";

import type { Enums } from "../supabase/database.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { upgradeSubscription } from "../request/api/subscription";

interface UpgradeSubscriptionParams {
  plan: Enums<"subscription_plan">;
  billingPeriod?: string;
}

/**
 * 升级订阅的 Hook
 */
export function useUpgradeSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      plan,
      billingPeriod
    }: UpgradeSubscriptionParams) => {
      const response = await upgradeSubscription({
        plan,
        billingPeriod
      });

      const data = response.data.data;

      return data!;
    },
    onSuccess: () => {
      // 使订阅查询失效，触发重新获取
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    },
    onError: (error: any) => {
      console.error("Upgrade error:", error);
    },
  });
}
