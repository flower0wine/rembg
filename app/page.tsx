import type { Metadata } from "next";
import { CTASection } from "@/components/features/landing/cta-section";
import { FeaturesSection } from "@/components/features/landing/features-section";
import { HeroSection } from "@/components/features/landing/hero-section";
import { HowItWorks } from "@/components/features/landing/how-it-works";
import { Testimonials } from "@/components/features/landing/testimonials";
import { ROUTES } from "@/lib/constants/routes";

export const metadata: Metadata = {
  title: "首页",
  description: "使用AI技术快速移除图片背景，支持单张和批量处理。无需专业技能，简单易用，效果专业。免费试用，立即开始。",
  openGraph: {
    title: "背景移除工具 - AI智能图片背景移除",
    description: "使用AI技术快速移除图片背景，支持单张和批量处理。无需专业技能，简单易用，效果专业。",
    type: "website",
  },
};

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection
        title="一键移除图片背景"
        subtitle="使用AI技术快速移除图片背景，支持单张和批量处理。无需专业技能，简单易用，效果专业。"
        ctaText="免费开始"
        ctaHref={ROUTES.APP}
      />
      <FeaturesSection features={[]} />
      <HowItWorks />
      <Testimonials />
      <CTASection />
    </main>
  );
}
