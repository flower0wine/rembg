"use client";

import type { SubscriptionPlan } from "@/lib/types";
import type { PricingPlanData } from "@/lib/types/pricing";
import { useRouter } from "next/navigation";
import { useState } from "react";
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

  // 分别调用两个 hook
  const { data } = useSubscriptionStatus();
  const upgradeMutation = useUpgradeSubscription();

  const subscription = data?.subscription;

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    // If user is not logged in, redirect to login

    console.log(subscription);

    if (!subscription) {
      router.push("/login");
      return;
    }

    // If selecting free plan, show message
    if (plan === "free") {
      return;
    }

    // Upgrade to selected plan
    upgradeMutation.mutate({
      plan,
      billingPeriod,
    });
  };

  return (
    <>
      {/* Billing Toggle */}
      <div className="flex justify-center mb-12">
        <PricingToggle
          value={billingPeriod}
          onChange={setBillingPeriod}
          savingsPercentage={20}
        />
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
        {plans.map(plan => (
          <PricingCard
            key={plan.id}
            plan={plan}
            billingPeriod={billingPeriod}
            onSelect={handlePlanSelect}
            isLoading={upgradeMutation.isPending}
            currentPlan={subscription?.plan}
          />
        ))}
      </div>
    </>
  );
}
