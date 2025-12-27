"use client";

import type { Tables } from "@/lib/supabase/database.types";
import { CreemCheckout } from "@creem_io/nextjs";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Crown, Sparkles, Zap } from "lucide-react";
import { useState } from "react";
import { useAuthContext } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { useSubscriptionStatus } from "@/lib/hooks/use-subscription-status";
import { cn } from "@/lib/utils";

const CREEM_PROJECT_IDS = {
  starter: process.env.NEXT_PUBLIC_CREEM_STARTER_PROJECT_ID!,
  pro: process.env.NEXT_PUBLIC_CREEM_PRO_PROJECT_ID!,
} as const;

interface PricingSectionProps {
  plans: Tables<"subscription_plans_config">[];
}

export function PricingSection({ plans }: PricingSectionProps) {
  const { user } = useAuthContext();
  const { data } = useSubscriptionStatus();
  const subscription = data?.subscription;

  const featuredIndex = plans.findIndex(p => p.is_featured);
  const [selectedIndex, setSelectedIndex] = useState(
    featuredIndex >= 0 ? featuredIndex : 0
  );

  const selectedPlan = plans[selectedIndex];
  const features = (selectedPlan?.features_json as string[]) || [];
  const isCurrentPlan = subscription?.plan === selectedPlan?.plan;
  const isFreePlan = selectedPlan?.plan === "free";
  const isPaidPlan
    = selectedPlan?.plan === "starter" || selectedPlan?.plan === "pro";

  const getProjectId = () => {
    if (selectedPlan?.plan === "starter")
      return CREEM_PROJECT_IDS.starter;
    if (selectedPlan?.plan === "pro")
      return CREEM_PROJECT_IDS.pro;
    return null;
  };

  const projectId = getProjectId();

  const getButtonText = () => {
    if (isFreePlan)
      return "Get Started";
    if (isCurrentPlan)
      return "当前方案";
    return "Upgrade Now";
  };

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case "free":
        return <Zap className="size-4" />;
      case "starter":
        return <Sparkles className="size-4" />;
      case "pro":
        return <Crown className="size-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {/* Segmented Control */}
      <div className="relative flex p-1 bg-muted rounded-xl mb-8">
        <motion.div
          className="absolute top-1 bottom-1 bg-background rounded-lg shadow-sm"
          initial={false}
          animate={{
            left: `calc(${(selectedIndex / plans.length) * 100}% + 4px)`,
            width: `calc(${100 / plans.length}% - 8px)`,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />

        {plans.map((plan, index) => {
          const isCurrent = subscription?.plan === plan.plan;
          return (
            <button
              key={plan.id}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-colors z-10",
                "flex items-center justify-center gap-2",
                selectedIndex === index
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground/80"
              )}
            >
              {getPlanIcon(plan.plan)}
              <span>{plan.display_name}</span>
              {isCurrent && (
                <span className="size-2 rounded-full bg-foreground" />
              )}
            </button>
          );
        })}
      </div>

      {/* Plan Details Card */}
      <AnimatePresence mode="wait">
        <SpotlightCard
          as="motion"
          key={selectedPlan?.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "rounded-2xl border p-8 relative",
            selectedPlan?.is_featured && "border-foreground/20 shadow-lg",
            isCurrentPlan && !selectedPlan?.is_featured && "border-foreground/20"
          )}
        >
          {/* Badge */}
          {(isCurrentPlan || selectedPlan?.is_featured) && (
            <div className="absolute top-0 right-0 px-4 py-2 text-sm font-medium rounded-tr-2xl rounded-bl-2xl bg-foreground text-background z-20">
              {isCurrentPlan
                ? (
                    <span className="flex items-center gap-2">
                      <Check className="size-4" />
                      当前方案
                    </span>
                  )
                : (
                    "Recommended"
                  )}
            </div>
          )}

          {/* Header */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-2">
              {selectedPlan?.display_name}
            </h3>
            <p className="text-muted-foreground">{selectedPlan?.description}</p>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-8">
            <span className="text-5xl font-bold tracking-tight">
              {isFreePlan ? "Free" : selectedPlan?.price_monthly}
            </span>
            {!isFreePlan && (
              <span className="text-muted-foreground">/month</span>
            )}
          </div>

          {/* Features */}
          <ul className="space-y-4 mb-8">
            {features.map((feature, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-3"
              >
                <div className="size-5 rounded-full bg-foreground/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="size-3 text-foreground" />
                </div>
                <span className="text-muted-foreground">{feature}</span>
              </motion.li>
            ))}
          </ul>

          {/* CTA Button */}
          {isPaidPlan && projectId
            ? (
                <div
                  className={cn(
                    "[&>a]:w-full w-full",
                    isCurrentPlan && "pointer-events-none opacity-60"
                  )}
                >
                  <CreemCheckout
                    productId={projectId}
                    successUrl="/subscription/checkout"
                    referenceId={user?.id}
                  >
                    <Button
                      size="lg"
                      className="w-full text-base"
                      variant={selectedPlan?.is_featured ? "default" : "outline"}
                      disabled={isCurrentPlan}
                    >
                      {getButtonText()}
                    </Button>
                  </CreemCheckout>
                </div>
              )
            : (
                <Button
                  size="lg"
                  className="w-full text-base"
                  variant={selectedPlan?.is_featured ? "default" : "outline"}
                >
                  {getButtonText()}
                </Button>
              )}
        </SpotlightCard>
      </AnimatePresence>
    </div>
  );
}
