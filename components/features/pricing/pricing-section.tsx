"use client";

import type { PricingPlan } from "@/lib/types";
import { useState } from "react";
import { PricingCard } from "@/components/features/pricing/pricing-card";
import { PricingToggle } from "@/components/features/pricing/pricing-toggle";

interface PricingSectionProps {
  plans: PricingPlan[];
}

export function PricingSection({ plans }: PricingSectionProps) {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">(
    "monthly"
  );

  const handlePlanSelect = (planId: string) => {
    // TODO: Implement plan selection logic (redirect to signup/checkout)
    console.log(`Selected plan: ${planId} with ${billingPeriod} billing`);
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
          />
        ))}
      </div>
    </>
  );
}
