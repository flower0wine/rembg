"use client";

import type { ProcessingHistoryItem } from "./history-client";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Calendar, CheckCircle, Clock, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ImageViewer } from "@/components/ui/image-viewer";
import { cn } from "@/lib/utils";
import { download } from "@/lib/utils/download.util";
import { getFileName } from "@/lib/utils/file";
import "dayjs/locale/zh-cn";

// 配置 dayjs
dayjs.extend(relativeTime);
dayjs.locale("zh-cn");

interface HistoryItemProps {
  item: ProcessingHistoryItem;
}

export function HistoryItem({ item }: HistoryItemProps) {
  const formatProcessingTime = (timeMs: number | null) => {
    if (!timeMs)
      return "未知";
    if (timeMs < 1000)
      return `${timeMs}ms`;
    return `${(timeMs / 1000).toFixed(1)}s`;
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).fromNow();
  };

  const handleDownload = () => {
    if (item.processed_image_url) {
      download(item.processed_image_url, `${getFileName(item.original_filename)}.png`);
    }
  };

  const canDownload = item.processing_status === "completed" && item.processed_image_url;
  const isProcessing = item.processing_status === "processing";
  const isCompleted = item.processing_status === "completed";

  return (
    <Card className="p-6 hover:shadow-md transition-shadow w-full">
      <div className="space-y-4">

        <ImageViewer
          className={cn(isProcessing && "opacity-40 blur-sm")}
          imageOne={item.processed_image_url || undefined}
          imageTwo={item.original_image_url!}
          imageOneAlt={`${item.original_filename}-original`}
          imageTwoAlt={`${item.original_filename}-processed`}
          showCheckeredBackground={isCompleted && !!item.processed_image_url}
        />

        {/* 操作按钮 */}
        <div className="flex items-center text-xs justify-between gap-2 pt-2 border-t">
          <div className="flex gap-3 text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(item.created_at)}</span>
            </div>
            {item.processing_time_ms && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatProcessingTime(item.processing_time_ms)}</span>
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={!canDownload}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            下载
          </Button>
        </div>
      </div>
    </Card>
  );
}