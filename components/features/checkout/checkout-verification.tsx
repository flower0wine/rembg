"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { useSubscriptionStatus } from "@/lib/hooks/use-subscription-status";
import { ProFeaturesList } from "./pro-features-list";

export function CheckoutVerification() {
  const [isVerifying, setIsVerifying] = useState(true);
  const { data, refetch } = useSubscriptionStatus();

  useEffect(() => {
    // 延迟一下再验证，给 webhook 时间处理
    const timer = setTimeout(async () => {
      await refetch();
      setIsVerifying(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [refetch]);

  const subscription = data?.subscription;
  const isPro = subscription?.plan === "pro";

  return (
    <>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4"
      >
        {isVerifying
          ? (
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            )
          : (
              <Check className="w-8 h-8 text-primary" />
            )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <CardTitle className="text-2xl font-bold mb-2">
          {isVerifying ? "正在验证订阅..." : "订阅成功！"}
        </CardTitle>

        <CardDescription>
          {isVerifying
            ? "我们正在处理您的订阅，请稍候..."
            : isPro
              ? "欢迎升级到 Pro 计划！您现在可以享受所有高级功能。"
              : "感谢您的订阅！"}
        </CardDescription>
      </motion.div>

      <AnimatePresence mode="wait">
        {!isVerifying && isPro && (
          <ProFeaturesList />
        )}
      </AnimatePresence>
    </>
  );
}