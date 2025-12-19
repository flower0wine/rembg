import { Loader2 } from "lucide-react";

interface PageLoadingProps {
  message?: string;
}

/**
 * Project-level loading component with animated skeleton
 * Provides a consistent loading experience across the application
 */
export function PageLoading({ message = "加载中" }: PageLoadingProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
      <div className="relative">
        {/* Outer ring */}
        <div className="h-16 w-16 rounded-full border-4 border-muted animate-pulse" />

        {/* Spinning loader */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>

      <div className="space-y-2 text-center">
        <p className="text-sm font-medium text-foreground">{message}</p>
        <div className="flex items-center justify-center space-x-1">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
        </div>
      </div>
    </div>
  );
}

/**
 * Compact loading component for inline use
 */
export function InlineLoading({ message = "加载中" }: PageLoadingProps) {
  return (
    <div className="flex items-center justify-center space-x-2 py-8">
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
      <span className="text-sm text-muted-foreground">{message}</span>
    </div>
  );
}

/**
 * Skeleton loading for list items
 */
export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border bg-card p-4 space-y-3 animate-pulse"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
            <div className="h-20 w-20 bg-muted rounded" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 bg-muted rounded w-20" />
            <div className="h-8 bg-muted rounded w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
