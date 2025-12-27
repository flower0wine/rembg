/**
 * User and authentication related type definitions
 */

export type SubscriptionPlan = "free" | "starter" | "pro";
export type BillingPeriod = "monthly";

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  billing_period?: BillingPeriod;
  usage_count: number;
  max_usage_limit: number;
  max_file_size_kb: number;
  max_concurrent: number;
  has_priority_support: boolean;
  has_advanced_analytics: boolean;
  subscription_start_date: string;
  subscription_end_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UsageRecord {
  id: string;
  user_id?: string;
  fingerprint?: string;
  created_at: string;
}

export interface UsageLimitResult {
  canProcess: boolean;
  remainingCount: number;
  requiresLogin: boolean;
  message?: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  plan: SubscriptionPlan;
  usageCount: number;
  maxUsageLimit: number | null;
  maxFileSizeKb: number;
  maxConcurrent: number;
  hasPrioritySupport: boolean;
  iat?: number;
  exp?: number;
}
