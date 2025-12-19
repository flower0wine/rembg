"use client";

import type { PricingCardProps } from "@/lib/types";
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

export function PricingCard({
  plan,
  billingPeriod,
  onSelect,
}: PricingCardProps) {
  const price
    = billingPeriod === "monthly" ? plan.monthlyPrice : plan.annualPrice;
  const displayPrice = billingPeriod === "annual" ? price / 12 : price;

  return (
    <Card
      className={cn(
        "relative flex flex-col transition-all hover:shadow-lg",
        plan.highlighted
        && "border-primary shadow-lg scale-105 hover:scale-[1.07]"
      )}
    >
      {plan.highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
          Recommended
        </div>
      )}

      <CardHeader>
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
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
          {billingPeriod === "annual" && (
            <p className="text-xs text-muted-foreground">
              Billed $
              {price}
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
          variant={plan.highlighted ? "default" : "outline"}
          onClick={() => onSelect(plan.id)}
        >
          {plan.ctaText}
        </Button>
      </CardFooter>
    </Card>
  );
}
