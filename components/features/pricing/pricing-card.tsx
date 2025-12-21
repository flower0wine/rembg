"use client";

import type { SubscriptionPlan } from "@/lib/types";
import type { PricingPlanData } from "@/lib/types/pricing";
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

export interface PricingCardProps {
  plan: PricingPlanData;
  billingPeriod: "monthly" | "annual";
  onSelect: (planId: SubscriptionPlan) => void;
  isLoading?: boolean;
  currentPlan?: string;
}

export function PricingCard({
  plan,
  billingPeriod,
  onSelect,
  isLoading = false,
  currentPlan,
}: PricingCardProps) {
  // 使用转换后的前端数据（单位：美元）
  const price = billingPeriod === "monthly"
    ? plan.monthlyPrice
    : plan.annualPrice;
  const displayPrice = billingPeriod === "annual" ? price / 12 : price;
  const isCurrentPlan = currentPlan === plan.plan;

  const ctaText = plan.plan === "free" ? "Get Started" : "Upgrade Now";

  return (
    <Card
      className={cn(
        "relative flex flex-col transition-all hover:shadow-lg",
        plan.isFeatured
        && "border-primary shadow-lg scale-105 hover:scale-[1.07]",
        isCurrentPlan && "border-green-500",
      )}
    >
      {plan.isFeatured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
          Recommended
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute -top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
          <Check className="w-3 h-3" />
          当前方案
        </div>
      )}

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
          {billingPeriod === "annual" && price > 0 && (
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
        <Button
          className="w-full"
          variant={plan.isFeatured ? "default" : "outline"}
          onClick={() => onSelect(plan.plan)}
          disabled={isLoading || isCurrentPlan}
        >
          {isCurrentPlan ? "当前方案" : ctaText}
        </Button>
      </CardFooter>
    </Card>
  );
}
