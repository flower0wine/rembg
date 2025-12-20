"use client";

import type { ProcessingHistory } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadImage } from "@/lib/utils/download.util";
import { HistoryItem } from "./history-item";

interface HistoryListProps {
  items: ProcessingHistory[];
  isLoading?: boolean;
  error?: Error | null;
  onDelete: (id: string) => void;
  onDeleteAll?: () => void;
  onRetry?: () => void;
}

export function HistoryList({
  items,
  isLoading = false,
  error = null,
  onDelete,
  onDeleteAll,
  onRetry,
}: HistoryListProps) {
  const handleDownload = (item: ProcessingHistory) => {
    // Extract filename without extension and add _no_bg suffix
    const nameWithoutExt = item.original_filename.replace(/\.[^/.]+$/, "");
    const filename = `${nameWithoutExt}_no_bg.png`;
    downloadImage(item.processed_image_url, filename);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
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

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="rounded-full bg-destructive/10 p-3">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <div className="text-center">
          <p className="font-medium text-sm">加载失败</p>
          <p className="text-sm text-muted-foreground mt-1">
            {error.message || "无法加载历史记录"}
          </p>
        </div>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            重试
          </Button>
        )}
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-12 gap-4"
      >
        <div className="rounded-full bg-muted p-4">
          <svg
            className="h-8 w-8 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div className="text-center">
          <p className="font-medium text-sm">暂无处理记录</p>
          <p className="text-sm text-muted-foreground mt-1">
            开始处理图片后，记录将显示在这里
          </p>
        </div>
      </motion.div>
    );
  }

  // List with items
  return (
    <div className="space-y-4">
      {/* Header with delete all button */}
      {onDeleteAll && items.length > 0 && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            共
            {" "}
            {items.length}
            {" "}
            条记录
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDeleteAll}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            清空全部
          </Button>
        </div>
      )}

      {/* Items list */}
      <AnimatePresence mode="popLayout">
        {items.map(item => (
          <HistoryItem
            key={item.id}
            item={item}
            onDownload={handleDownload}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
