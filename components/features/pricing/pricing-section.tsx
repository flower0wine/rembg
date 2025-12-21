"use client";

import type { SubscriptionPlan } from "@/lib/types";
import type { PricingPlanData } from "@/lib/types/pricing";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { PricingCard } from "@/components/features/pricing/pricing-card";
import { PricingToggle } from "@/components/features/pricing/pricing-toggle";
import { useSubscriptionStatus } from "@/lib/hooks/use-subscription-status";
import { useUpgradeSubscription } from "@/lib/hooks/use-upgrade-subscription";

interface PricingSectionProps {
  plans: PricingPlanData[];
}

export function PricingSection({ plans }: PricingSectionProps) {
  const router = useRouter();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">(
    "monthly",
  );
  const [loadingPlan, setLoadingPlan] = useState<SubscriptionPlan | null>(null);

  // 分别调用两个 hook
  const { data } = useSubscriptionStatus();
  const upgradeMutation = useUpgradeSubscription();

  const subscription = data?.subscription;

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    // If user is not logged in, redirect to login

    if (!subscription) {
      router.push("/login");
      return;
    }

    // If selecting free plan, show message
    if (plan === "free") {
      return;
    }

    // 设置当前正在处理的计划
    setLoadingPlan(plan);

    // Upgrade to selected plan
    upgradeMutation.mutate(
      {
        plan,
        billingPeriod,
      },
      {
        onSuccess: () => {
          toast.success("升级成功！", {
            description: "您的订阅计划已更新",
          });
          setLoadingPlan(null);
        },
        onError: (error: any) => {
          toast.error("升级失败", {
            description: error.message || "请稍后重试",
          });
          setLoadingPlan(null);
        },
      },
    );
  };

  return (
    <>
      {/* Billing Toggle */}
      <motion.div
        className="flex justify-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <PricingToggle
          value={billingPeriod}
          onChange={setBillingPeriod}
          savingsPercentage={20}
        />
      </motion.div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
        {plans.map((plan, index) => (
          <PricingCard
            key={plan.id}
            plan={plan}
            billingPeriod={billingPeriod}
            onSelect={handlePlanSelect}
            isLoading={upgradeMutation.isPending}
            loadingPlan={loadingPlan}
            currentPlan={subscription?.plan}
            index={index}
          />
        ))}
      </div>
    </>
  );
}
