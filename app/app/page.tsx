import { Suspense } from "react";
import { AuthGuard } from "@/components/features/auth/auth-guard";
import { RembgWorkspace } from "@/components/features/rembg";
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
      <div className="container mx-auto px-4 py-8 flex flex-col items-center max-w-[800px]">
        <Suspense fallback={<PageLoading message="正在加载" />}>
          <RembgWorkspace />
        </Suspense>
      </div>
    </AuthGuard>
  );
}
