"use client";

import type { Enums, Tables } from "@/lib/supabase/database.types";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Sparkles, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { useSubscriptionStatus } from "@/lib/hooks/use-subscription-status";

interface PlanFeaturesListProps {
  plan: Enums<"subscription_plan">;
  subscription: Tables<"user_subscriptions">;
}

function PlanFeaturesList({ subscription, plan }: PlanFeaturesListProps) {
  const { max_usage_limit, max_file_size_kb, max_concurrent, has_priority_support, has_advanced_analytics } = subscription;

  if (plan === "free") {
    console.warn("plan can't is free");
    return;
  }

  // 根据计划类型设置样式
  const config = {
    starter: {
      name: "Starter",
      displayName: "Starter 计划",
      icon: Zap,
      color: "text-primary-500",
      bgColor: "bg-primary-500/10",
      borderColor: "border-primary-500/20",
    },
    pro: {
      name: "Pro",
      displayName: "Pro 计划",
      icon: Sparkles,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20",
    },
  }[plan];

  const Icon = config.icon;

  // 根据 subscription 数据动态生成特性列表
  const features = [
    `每月 ${max_usage_limit} 次使用额度`,
    `${Math.round(max_file_size_kb / 1024)}MB 最大文件大小`,
    `批量处理（${max_concurrent} 个文件）`,
    has_priority_support ? "优先技术支持" : "标准技术支持",
  ];

  return (
    <motion.div
      key={`${plan}-features`}
      initial={{ opacity: 0, height: 0, y: -10 }}
      animate={{
        opacity: 1,
        height: "auto",
        y: 0,
        transition: {
          height: { duration: 0.4, ease: "easeOut" },
          opacity: { duration: 0.3, delay: 0.1 },
          y: { duration: 0.3, delay: 0.1 },
        },
      }}
      exit={{
        opacity: 0,
        height: 0,
        y: -10,
        transition: {
          height: { duration: 0.3, ease: "easeIn" },
          opacity: { duration: 0.2 },
          y: { duration: 0.2 },
        },
      }}
      className={`${config.bgColor} border ${config.borderColor} rounded-lg p-4 overflow-hidden`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-5 h-5 ${config.color}`} />
        <h3 className={`font-semibold ${config.color}`}>
          {config.displayName}
          特权
        </h3>
      </div>
      <ul className="text-sm text-muted-foreground space-y-1.5 text-left">
        {features.map((feature, index) => (
          <motion.li
            key={feature}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
            className="flex items-start gap-2"
          >
            <Check className={`w-4 h-4 mt-0.5 shrink-0 ${config.color}`} />
            <span>{feature}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}

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
  const plan = subscription?.plan;
  const isPaidPlan = plan === "starter" || plan === "pro";

  // 根据计划类型设置样式和消息
  const planDisplay = plan && isPaidPlan
    ? {
        starter: {
          name: "Starter",
          badge: "Starter",
          bgColor: "bg-blue-500/10",
          color: "text-blue-500",
          welcomeMessage: "欢迎加入 Starter 计划！开始您的高效之旅。",
        },
        pro: {
          name: "Pro",
          badge: "Pro",
          bgColor: "bg-primary/10",
          color: "text-primary",
          welcomeMessage: "欢迎升级到 Pro 计划！您现在可以享受所有高级功能。",
        },
      }[plan]
    : null;

  console.log(subscription);


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
        className="space-y-3"
      >
        <div className="flex items-center justify-center gap-2">
          <CardTitle className="text-2xl font-bold">
            {isVerifying ? "正在验证订阅..." : "订阅成功！"}
          </CardTitle>
        </div>

        <CardDescription>
          {isVerifying
            ? "我们正在处理您的订阅，请稍候..."
            : planDisplay
              ? planDisplay.welcomeMessage
              : "感谢您的订阅！"}
        </CardDescription>
      </motion.div>

      <AnimatePresence mode="wait">
        {!isVerifying && isPaidPlan && subscription && plan && (plan === "starter" || plan === "pro") && (
          <PlanFeaturesList subscription={subscription} plan={plan} />
        )}
      </AnimatePresence>
    </>
  );
}