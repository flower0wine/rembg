import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyEmailContent } from "@/components/features/auth/verify-email-content";

export const metadata: Metadata = {
  title: "验证邮箱",
  description: "我们已向您的邮箱发送了验证链接，请查收邮件并完成验证。",
  openGraph: {
    title: "验证邮箱 | 背景移除工具",
    description: "我们已向您的邮箱发送了验证链接，请查收邮件并完成验证。",
    type: "website",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Suspense fallback={<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
