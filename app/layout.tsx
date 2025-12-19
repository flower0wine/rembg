import type { Metadata } from "next";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/providers/auth-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { RecaptchaProvider } from "@/components/providers/recaptcha-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "背景移除工具 - AI智能图片背景移除",
    template: "%s | 背景移除工具",
  },
  description: "使用AI技术快速移除图片背景，支持单张和批量处理。无需专业技能，简单易用，效果专业。支持PNG、JPG、WebP格式，最大10MB文件。",
  keywords: ["背景移除", "图片处理", "AI背景移除", "批量处理", "透明背景", "抠图工具"],
  authors: [{ name: "Background Removal Tool" }],
  creator: "Background Removal Tool",
  publisher: "Background Removal Tool",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "/",
    title: "背景移除工具 - AI智能图片背景移除",
    description: "使用AI技术快速移除图片背景，支持单张和批量处理。无需专业技能，简单易用，效果专业。",
    siteName: "背景移除工具",
  },
  twitter: {
    card: "summary_large_image",
    title: "背景移除工具 - AI智能图片背景移除",
    description: "使用AI技术快速移除图片背景，支持单张和批量处理。无需专业技能，简单易用，效果专业。",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      "index": true,
      "follow": true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <RecaptchaProvider>
            <QueryProvider>
              <AuthProvider>
                {children}
                <Toaster
                  position="bottom-right"
                  duration={3000}
                  closeButton
                  richColors
                />
              </AuthProvider>
            </QueryProvider>
          </RecaptchaProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
