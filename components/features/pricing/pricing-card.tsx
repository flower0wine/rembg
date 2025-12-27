"use client";

import type { Tables } from "@/lib/supabase/database.types";
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

// Creem projectId 配置 - starter 和 pro 使用不同的 projectId
const CREEM_PROJECT_IDS = {
  starter: process.env.NEXT_PUBLIC_CREEM_STARTER_PROJECT_ID!,
  pro: process.env.NEXT_PUBLIC_CREEM_PRO_PROJECT_ID!,
} as const;

export interface PricingCardProps {
  plan: Tables<"subscription_plans_config">;
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
  currentPlan,
  userId,
  index = 0,
}: PricingCardProps) {
  const isCurrentPlan = currentPlan === plan.plan;
  const isFreePlan = plan.plan === "free";
  const isPaidPlan = plan.plan === "starter" || plan.plan === "pro";

  // 获取对应的 Creem projectId
  const getCreemProjectId = () => {
    if (plan.plan === "starter")
      return CREEM_PROJECT_IDS.starter;
    if (plan.plan === "pro")
      return CREEM_PROJECT_IDS.pro;
    return null;
  };

  const projectId = getCreemProjectId();

  const getButtonText = () => {
    if (isCurrentPlan)
      return "当前方案";
    if (isFreePlan)
      return "Get Started";
    return "Upgrade Now";
  };

  const isButtonDisabled = isCurrentPlan || (!userId && isPaidPlan);

  // 解析 features_json
  const features = (plan.features_json as string[]) || [];

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
          plan.is_featured && "border-primary shadow-lg scale-105 hover:scale-[1.07]",
          isCurrentPlan && !plan.is_featured && "border-green-500",
        )}
      >
        <PlanBadge
          isCurrentPlan={isCurrentPlan}
          isFeatured={plan.is_featured}
          index={index}
        />

        <CardHeader>
          <CardTitle className="text-2xl">{plan.display_name}</CardTitle>
          <CardDescription>{plan.description}</CardDescription>
        </CardHeader>

        <CardContent className="flex-1 space-y-6">
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">
                {isFreePlan ? "Free" : `$${plan.plan === "starter" ? "9" : "19"}`}
              </span>
              {!isFreePlan && (
                <span className="text-muted-foreground text-sm">/month</span>
              )}
            </div>
          </div>

          <FeatureList features={features} />
        </CardContent>

        <CardFooter>
          {isPaidPlan && projectId
            ? (
                <div className="[&>a]:w-full w-full">
                  <CreemCheckout
                    productId={projectId}
                    successUrl="/subscription/checkout"
                    referenceId={userId}
                  >
                    <Button
                      className="w-full"
                      variant={plan.is_featured ? "default" : "outline"}
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
                  variant={plan.is_featured ? "default" : "outline"}
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
