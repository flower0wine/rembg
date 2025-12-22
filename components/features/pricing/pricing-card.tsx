"use client";

import type { SubscriptionPlan } from "@/lib/types";
import type { PricingPlanData } from "@/lib/types/pricing";
import { CreemCheckout } from "@creem_io/nextjs";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
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
  isLoading?: boolean;
  loadingPlan?: SubscriptionPlan | null;
  currentPlan?: string;
  userId?: string;
  index?: number;
}

export function PricingCard({
  plan,
  billingPeriod,
  onSelect,
  isLoading = false,
  loadingPlan = null,
  currentPlan,
  userId,
  index = 0,
}: PricingCardProps) {
  // 使用转换后的前端数据（单位：美元）
  const price = billingPeriod === "monthly"
    ? plan.monthlyPrice
    : plan.annualPrice;
  const displayPrice = billingPeriod === "annual" ? price / 12 : price;
  const isCurrentPlan = currentPlan === plan.plan;
  const isThisCardLoading = isLoading && loadingPlan === plan.plan;

  const ctaText = plan.plan === "free" ? "Get Started" : "Upgrade Now";

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
          plan.isFeatured && !isCurrentPlan
          && "border-primary shadow-lg scale-105 hover:scale-[1.07]",
          isCurrentPlan && plan.isFeatured
          && "border-primary shadow-xl scale-105 hover:scale-[1.07]",
          isCurrentPlan && !plan.isFeatured && "border-green-500",
        )}
      >
        {/* 合并标签：当既是推荐方案又是当前方案时，显示组合标签 */}
        {isCurrentPlan && plan.isFeatured
          ? (
              <motion.div
                className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-500 to-primary text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 + 0.3, duration: 0.3 }}
              >
                <Check className="w-4 h-4" />
                <span>当前方案 · Recommended</span>
              </motion.div>
            )
          : isCurrentPlan
            ? (
                <motion.div
                  className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.4, type: "spring" }}
                >
                  <Check className="w-4 h-4" />
                  <span>当前方案</span>
                </motion.div>
              )
            : plan.isFeatured
              ? (
                  <motion.div
                    className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium shadow-lg"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.3, duration: 0.3 }}
                  >
                    Recommended
                  </motion.div>
                )
              : null}

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
          {plan.plan === "pro"
            ? (
                <CreemCheckout
                  productId={projectId}
                  successUrl="/subscription/checkout"
                  referenceId={userId}
                >
                  <Button
                    className="w-full"
                    variant={plan.isFeatured ? "default" : "outline"}
                    disabled={isLoading || isCurrentPlan || !userId}
                  >
                    {isThisCardLoading
                      ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            处理中...
                          </>
                        )
                      : isCurrentPlan
                        ? (
                            "当前方案"
                          )
                        : !userId
                            ? (
                                "请先登录"
                              )
                            : (
                                ctaText
                              )}
                  </Button>
                </CreemCheckout>
              )
            : (
                <Button
                  className="w-full"
                  variant={plan.isFeatured ? "default" : "outline"}
                  onClick={() => onSelect(plan.plan)}
                  disabled={isLoading || isCurrentPlan}
                >
                  {isThisCardLoading
                    ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          处理中...
                        </>
                      )
                    : isCurrentPlan
                      ? (
                          "当前方案"
                        )
                      : (
                          ctaText
                        )}
                </Button>
              )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
