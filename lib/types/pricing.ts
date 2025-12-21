/**
 * Pricing component props type definitions
 * 前端展示用的定价数据类型（与数据库结构解耦）
 */

import type { SubscriptionPlan } from "./user";

/**
 * 前端定价卡片数据
 */
export interface PricingPlanData {
  id: string;
  plan: SubscriptionPlan;
  displayName: string;
  description: string;
  monthlyPrice: number; // 单位：美元
  annualPrice: number; // 单位：美元
  features: string[];
  isFeatured: boolean;
  limits: {
    maxUsageLimit: number;
    maxFileSize: number; // MB
    maxBatchSize: number;
  };
  capabilities: {
    hasApiAccess: boolean;
    hasPrioritySupport: boolean;
    hasAdvancedAnalytics: boolean;
    hasCustomBranding: boolean;
  };
}

export interface PricingToggleProps {
  value: "monthly" | "annual";
  onChange: (value: "monthly" | "annual") => void;
  savingsPercentage?: number; // Annual savings percentage
}
