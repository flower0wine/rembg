import { Suspense } from "react";
import { AuthGuard } from "@/components/features/auth/auth-guard";
import { HistoryClient } from "@/components/features/history/history-client";
import { ListSkeleton } from "@/components/ui/page-loading";

export default function HistoryPage() {
  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8 max-w-10xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">处理历史</h1>
          <p className="text-muted-foreground">
            查看和管理您的图片处理记录
          </p>
        </div>

        <Suspense fallback={<ListSkeleton count={5} />}>
          <HistoryClient />
        </Suspense>
      </div>
    </AuthGuard>
  );
}
