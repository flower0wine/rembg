"use client";

import { useQuery } from "@tanstack/react-query";
import { getSubscriptionStatus } from "../request/api/subscription";

/**
 * 获取订阅状态的 Hook
 */
export function useSubscriptionStatus(
) {
  return useQuery({
    queryKey: ["subscription", "status"],
    queryFn: async () => {
      const response = await getSubscriptionStatus();

      const data = response.data;

      return data;
    },
  });
}
