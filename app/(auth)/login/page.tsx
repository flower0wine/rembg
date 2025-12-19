import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "@/components/features/auth/login-form";

export const metadata: Metadata = {
  title: "登录",
  description: "登录您的账户以访问完整的背景移除功能，包括无限处理次数、批量处理和历史记录。",
  openGraph: {
    title: "登录 | 背景移除工具",
    description: "登录您的账户以访问完整的背景移除功能，包括无限处理次数、批量处理和历史记录。",
    type: "website",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Suspense fallback={<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
