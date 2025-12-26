"use client";

import type { SubscriptionPlan } from "@/lib/types";
import type { PricingPlanData } from "@/lib/types/pricing";
import { CreemCheckout } from "@creem_io/nextjs";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FeatureList } from "./feature-list";

const projectId = process.env.NEXT_PUBLIC_CREEM_PROJECT_ID!;

export interface PricingCardProps {
  plan: PricingPlanData;
  billingPeriod: "monthly" | "annual";
  onSelect: (planId: SubscriptionPlan) => void;
  currentPlan?: string;
  userId?: string;
  index?: number;
}

interface PlanBadgeProps {
  isCurrentPlan: boolean;
  isFeatured: boolean;
  index: number;
}

function PlanBadge({ isCurrentPlan, isFeatured, index }: PlanBadgeProps) {
  if (!isCurrentPlan && !isFeatured)
    return null;

  const badgeConfig = {
    current: {
      className: "bg-green-500 text-white",
      label: "当前方案",
    },
    featured: {
      className: "bg-primary text-primary-foreground",
      label: "Recommended",
    },
    both: {
      className: "bg-gradient-to-r from-green-500 to-primary text-white",
      label: "当前方案 · Recommended",
    },
  };

  const config = isCurrentPlan && isFeatured
    ? badgeConfig.both
    : isCurrentPlan
      ? badgeConfig.current
      : badgeConfig.featured;

  return (
    <motion.div
      className={cn(
        "absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-sm font-medium shadow-lg flex items-center gap-2",
        config.className,
      )}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 + 0.3, duration: 0.3 }}
    >
      {isCurrentPlan && <Check className="w-4 h-4" />}
      <span>{config.label}</span>
    </motion.div>
  );
}

export function PricingCard({
  plan,
  billingPeriod,
  onSelect,
  currentPlan,
  userId,
  index = 0,
}: PricingCardProps) {
  const isCurrentPlan = currentPlan === plan.plan;
  const isProPlan = plan.plan === "pro";

  const price = billingPeriod === "monthly" ? plan.monthlyPrice : plan.annualPrice;
  const displayPrice = billingPeriod === "annual" ? price / 12 : price;
  const isAnnualBilling = billingPeriod === "annual" && price > 0;

  const getButtonText = () => {
    if (isCurrentPlan)
      return "当前方案";
    return plan.plan === "free" ? "Get Started" : "Upgrade Now";
  };

  const isButtonDisabled = isCurrentPlan || (!userId && isProPlan);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: "easeOut",
      }}
      whileHover={{ y: -8 }}
    >
      <Card
        className={cn(
          "relative flex flex-col transition-all hover:shadow-lg",
          plan.isFeatured && "border-primary shadow-lg scale-105 hover:scale-[1.07]",
          isCurrentPlan && !plan.isFeatured && "border-green-500",
        )}
      >
        <PlanBadge
          isCurrentPlan={isCurrentPlan}
          isFeatured={plan.isFeatured}
          index={index}
        />

        <CardHeader>
          <CardTitle className="text-2xl">{plan.displayName}</CardTitle>
          <CardDescription>{plan.description}</CardDescription>
        </CardHeader>

        <CardContent className="flex-1 space-y-6">
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">
                $
                {displayPrice.toFixed(0)}
              </span>
              <span className="text-muted-foreground text-sm">/month</span>
            </div>
            {isAnnualBilling && (
              <p className="text-xs text-muted-foreground">
                Billed $
                {price.toFixed(0)}
                {" "}
                annually
              </p>
            )}
          </div>

          <FeatureList features={plan.features} />
        </CardContent>

        <CardFooter>
          {isProPlan
            ? (
                <div className="[&>a]:w-full w-full">
                  <CreemCheckout
                    productId={projectId}
                    successUrl="/subscription/checkout"
                    referenceId={userId}
                  >
                    <Button
                      className="w-full"
                      variant={plan.isFeatured ? "default" : "outline"}
                      disabled={isButtonDisabled}
                    >
                      {getButtonText()}
                    </Button>
                  </CreemCheckout>
                </div>
              )
            : (
                <Button
                  className="w-full"
                  variant={plan.isFeatured ? "default" : "outline"}
                  onClick={() => onSelect(plan.plan)}
                  disabled={isCurrentPlan}
                >
                  {getButtonText()}
                </Button>
              )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
