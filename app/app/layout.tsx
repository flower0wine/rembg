import type { Metadata } from "next";
import { FullscreenDropZone } from "@/components/features/rembg";
import OverflowHidden from "@/components/features/rembg/overflow-hidden";
import { FullscreenDropProvider } from "@/components/providers/fullscreen-drop-provider";

export const metadata: Metadata = {
  title: "背景移除应用",
  description: "上传图片，一键移除背景。支持本地文件、URL输入和拖拽上传，支持单张和批量处理。",
  openGraph: {
    title: "背景移除应用 | 背景移除工具",
    description: "上传图片，一键移除背景。支持本地文件、URL输入和拖拽上传，支持单张和批量处理。",
    type: "website",
  },
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OverflowHidden>
      <FullscreenDropProvider>
        <FullscreenDropZone>
          <div className="h-[calc(100vh-56px)] sm:h-[calc(100vh-64px)] flex flex-col overflow-hidden">
            <main className="flex-1 flex flex-col overflow-auto">{children}</main>
          </div>
        </FullscreenDropZone>
      </FullscreenDropProvider>
    </OverflowHidden>
  );
}
