"use client";

import { useEffect, useState } from "react";
import { useAuthContext } from "@/components/providers/auth-provider";

/**
 * Hook 用于检查和初始化用户订阅
 * 在用户登录后自动检查订阅状态
 */
export function useSubscriptionCheck() {
  const { user } = useAuthContext();
  const [isChecking, setIsChecking] = useState(false);
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);

  useEffect(() => {
    // 只在用户登录且还未检查过时执行
    if (!user || hasSubscription !== null) {
      return;
    }

    const checkSubscription = async () => {
      setIsChecking(true);
      try {
        const response = await fetch("/api/subscription/initialize", {
          method: "GET",
        });

        if (response.ok) {
          const data = await response.json();
          setHasSubscription(data.hasSubscription);

          // 如果没有订阅，自动初始化
          if (!data.hasSubscription) {
            const initResponse = await fetch("/api/subscription/initialize", {
              method: "POST",
            });

            if (initResponse.ok) {
              setHasSubscription(true);
            }
          }
        }
      }
      catch (error) {
        console.error("Failed to check subscription:", error);
      }
      finally {
        setIsChecking(false);
      }
    };

    checkSubscription();
  }, [user, hasSubscription]);

  return {
    isChecking,
    hasSubscription,
  };
}
