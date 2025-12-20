/**
 * Pricing component props type definitions
 */

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  highlighted?: boolean;
  ctaText: string;
}

export interface PricingCardProps {
  plan: PricingPlan;
  billingPeriod: "monthly" | "annual";
  onSelect: (planId: string) => void;
}

export interface PricingToggleProps {
  value: "monthly" | "annual";
  onChange: (value: "monthly" | "annual") => void;
  savingsPercentage?: number; // Annual savings percentage
}
