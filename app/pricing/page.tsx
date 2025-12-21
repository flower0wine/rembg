import type { Tables } from "@/lib/supabase/database.types";
import type { PricingPlanData } from "@/lib/types/pricing";
import { PricingSection } from "@/components/features/pricing/pricing-section";
import { getVisiblePlans } from "@/lib/supabase/subscription-plans";

/**
 * 将数据库的定价配置转换为前端展示数据
 * 这样可以隐藏数据库结构，只暴露前端需要的字段
 */
function transformPlanData(
  dbPlan: Tables<"subscription_plans_config">,
): PricingPlanData {
  return {
    id: dbPlan.id,
    plan: dbPlan.plan,
    displayName: dbPlan.display_name,
    description: dbPlan.description || "",
    monthlyPrice: dbPlan.monthly_price_cents / 100, // 转换为美元
    annualPrice: dbPlan.annual_price_cents / 100, // 转换为美元
    features: (dbPlan.features_json as string[]) || [],
    isFeatured: dbPlan.is_featured,
    limits: {
      maxUsageLimit: dbPlan.max_usage_limit,
      maxFileSize: dbPlan.max_file_size_mb,
      maxBatchSize: dbPlan.max_batch_size,
    },
    capabilities: {
      hasApiAccess: dbPlan.has_api_access,
      hasPrioritySupport: dbPlan.has_priority_support,
      hasAdvancedAnalytics: dbPlan.has_advanced_analytics,
      hasCustomBranding: dbPlan.has_custom_branding,
    },
  };
}

export default async function PricingPage() {
  // 从数据库获取定价配置
  const dbPlans = await getVisiblePlans();

  // 转换为前端数据格式
  const plans: PricingPlanData[] = dbPlans.map(transformPlanData);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-lg text-muted-foreground">
          Select the perfect plan for your needs
        </p>
      </div>

      <PricingSection plans={plans} />
    </div>
  );
}
