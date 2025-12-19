import type { Metadata } from "next";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export const metadata: Metadata = {
  title: "处理历史",
  description: "查看和管理您的图片处理记录，重新下载之前处理过的图片。",
  openGraph: {
    title: "处理历史 | 背景移除工具",
    description: "查看和管理您的图片处理记录，重新下载之前处理过的图片。",
    type: "website",
  },
};

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
