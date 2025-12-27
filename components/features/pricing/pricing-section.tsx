"use client";

import type { Tables } from "@/lib/supabase/database.types";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { PricingCard } from "@/components/features/pricing/pricing-card";
import { useSubscriptionStatus } from "@/lib/hooks/use-subscription-status";
import { createClient } from "@/lib/supabase/client";

interface PricingSectionProps {
  plans: Tables<"subscription_plans_config">[];
}

export function PricingSection({ plans }: PricingSectionProps) {
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

  return (
    <motion.div
      className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-start"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {plans.map((plan, index) => (
        <PricingCard
          key={plan.id}
          plan={plan}
          currentPlan={subscription?.plan}
          userId={userId}
          index={index}
        />
      ))}
    </motion.div>
  );
}
