import type { Metadata } from "next";
import type { Tables } from "@/lib/supabase/database.types";
import type { PricingPlanData } from "@/lib/types/pricing";
import { PricingSection } from "@/components/features/pricing/pricing-section";
import { getVisiblePlans } from "@/lib/supabase/subscription-plans";

export const metadata: Metadata = {
  title: "定价方案",
  description: "选择适合您需求的AI背景移除工具定价方案。提供免费试用、个人版和专业版，支持单张和批量处理，满足不同用户需求。",
  keywords: ["定价", "价格", "套餐", "AI背景移除价格", "图片处理定价", "批量处理价格", "订阅方案"],
  openGraph: {
    title: "定价方案 - AI背景移除工具",
    description: "选择适合您需求的AI背景移除工具定价方案。提供免费试用、个人版和专业版，支持单张和批量处理。",
    type: "website",
    url: "/pricing",
  },
  twitter: {
    card: "summary_large_image",
    title: "定价方案 - AI背景移除工具",
    description: "选择适合您需求的AI背景移除工具定价方案。提供免费试用、个人版和专业版，支持单张和批量处理。",
  },
  alternates: {
    canonical: "/pricing",
  },
};

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

  // 生成结构化数据
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "AI背景移除工具",
    "description": "使用AI技术快速移除图片背景的专业工具",
    "offers": plans.map(plan => ({
      "@type": "Offer",
      "name": plan.displayName,
      "description": plan.description,
      "price": plan.monthlyPrice,
      "priceCurrency": "USD",
      "priceValidUntil": "2025-12-31",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "背景移除工具"
      }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">选择您的定价方案</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            我们提供灵活的定价选项，满足个人用户到企业客户的不同需求。
            所有方案都包含AI智能背景移除功能，让您轻松处理图片。
          </p>
        </header>

        <main>
          <PricingSection plans={plans} />
        </main>

        <section className="mt-16 text-center">
          <h2 className="text-2xl font-semibold mb-4">常见问题</h2>
          <div className="max-w-3xl mx-auto text-left space-y-4">
            <details className="border rounded-lg p-4">
              <summary className="font-medium cursor-pointer">可以随时取消订阅吗？</summary>
              <p className="mt-2 text-muted-foreground">
                是的，您可以随时取消订阅。取消后，您仍可以使用服务直到当前计费周期结束。
              </p>
            </details>
            <details className="border rounded-lg p-4">
              <summary className="font-medium cursor-pointer">支持哪些图片格式？</summary>
              <p className="mt-2 text-muted-foreground">
                我们支持PNG、JPG、JPEG、WebP等常见图片格式，单个文件最大支持10MB。
              </p>
            </details>
            <details className="border rounded-lg p-4">
              <summary className="font-medium cursor-pointer">处理后的图片质量如何？</summary>
              <p className="mt-2 text-muted-foreground">
                我们使用先进的AI算法，确保背景移除后的图片保持高质量，边缘清晰自然。
              </p>
            </details>
          </div>
        </section>
      </div>
    </>
  );
}
