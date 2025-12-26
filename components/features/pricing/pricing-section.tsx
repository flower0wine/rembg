"use client";

import type { SubscriptionPlan } from "@/lib/types";
import type { PricingPlanData } from "@/lib/types/pricing";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PricingCard } from "@/components/features/pricing/pricing-card";
import { PricingToggle } from "@/components/features/pricing/pricing-toggle";
import { useSubscriptionStatus } from "@/lib/hooks/use-subscription-status";
import { createClient } from "@/lib/supabase/client";

interface PricingSectionProps {
  plans: PricingPlanData[];
}

export function PricingSection({ plans }: PricingSectionProps) {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly");
  const [userId, setUserId] = useState<string | undefined>(undefined);

  const { data } = useSubscriptionStatus();
  const subscription = data?.subscription;

  useEffect(() => {
    const getCurrentUser = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getClaims();
      setUserId(data?.claims?.id);
    };

    getCurrentUser();
  }, []);

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    toast.info("暂不提供该订阅方案", {
      description: "目前只支持升级 Pro 计划",
    });
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
            currentPlan={subscription?.plan}
            userId={userId}
            index={index}
          />
        ))}
      </div>
    </>
  );
}
