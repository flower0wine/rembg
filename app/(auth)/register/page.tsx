import type { Metadata } from "next";
import { RegisterForm } from "@/components/features/auth/register-form";

export const metadata: Metadata = {
  title: "注册",
  description: "创建账户以享受无限制的背景移除服务，包括批量处理、历史记录和高级功能。",
  openGraph: {
    title: "注册 | 背景移除工具",
    description: "创建账户以享受无限制的背景移除服务，包括批量处理、历史记录和高级功能。",
    type: "website",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <RegisterForm />
    </div>
  );
}
