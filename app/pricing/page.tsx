import type { Metadata } from "next";
import type { PricingPlan } from "@/lib/types";
import { PricingSection } from "@/components/features/pricing/pricing-section";

export const metadata: Metadata = {
  title: "定价方案",
  description: "选择适合您需求的完美方案。简单透明的定价，无隐藏费用。免费试用，专业版和企业版满足不同需求。",
  keywords: ["定价", "价格", "订阅", "套餐", "背景移除价格"],
  openGraph: {
    title: "定价方案 | 背景移除工具",
    description: "选择适合您需求的完美方案。简单透明的定价，无隐藏费用。免费试用，专业版和企业版满足不同需求。",
    type: "website",
  },
};

const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "Perfect for trying out the service",
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      "1 free background removal",
      "Up to 10MB file size",
      "PNG, JPG, WebP formats",
      "Basic image quality",
    ],
    ctaText: "Get Started",
  },
  {
    id: "pro",
    name: "Pro",
    description: "For individuals and small teams",
    monthlyPrice: 19,
    annualPrice: 182, // ~$15.17/month (20% savings)
    features: [
      "Unlimited background removals",
      "Up to 25MB file size",
      "All image formats",
      "High-quality processing",
      "Batch processing (up to 50 images)",
      "Processing history",
      "Priority support",
    ],
    highlighted: true,
    ctaText: "Start Pro Trial",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large teams and businesses",
    monthlyPrice: 99,
    annualPrice: 950, // ~$79.17/month (20% savings)
    features: [
      "Everything in Pro",
      "Unlimited file size",
      "API access",
      "Batch processing (unlimited)",
      "Custom integrations",
      "Dedicated support",
      "SLA guarantee",
      "Team management",
    ],
    ctaText: "Contact Sales",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header - Server Component */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your needs. All plans include our core
            background removal features.
          </p>
        </div>

        {/* Interactive Section - Client Component */}
        <PricingSection plans={pricingPlans} />

        {/* Footer - Server Component */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            All plans include a 14-day money-back guarantee. No questions asked.
          </p>
        </div>
      </div>
    </div>
  );
}
