import { Suspense } from "react";
import { AuthGuard } from "@/components/features/auth/auth-guard";
import { RemBgClient } from "@/components/features/rembg";
import { PageLoading } from "@/components/ui/page-loading";

/**
 * Main application page for background removal (Server Component)
 * Integrates single and batch processing modes
 *
 * **Validates: Requirements 1.1, 2.1, 3.1, 9.1**
 */
export default function AppPage() {
  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold">背景移除工具</h1>
          <p className="text-muted-foreground">
            上传图片，一键移除背景
          </p>
        </div>

        <Suspense fallback={<PageLoading message="正在加载工具" />}>
          <RemBgClient />
        </Suspense>
      </div>
    </AuthGuard>
  );
}
