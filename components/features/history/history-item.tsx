"use client";

import type { ProcessingHistoryItem } from "./history-client";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { motion } from "framer-motion";
import { AlertCircle, Calendar, CheckCircle, Clock, Download, Eye, FileImage, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  const [showPreview, setShowPreview] = useState(false);

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

  const getStatusInfo = (status: ProcessingHistoryItem["processing_status"]) => {
    switch (status) {
      case "processing":
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          text: "处理中",
          color: "bg-blue-500",
          textColor: "text-blue-600",
          bgColor: "bg-blue-50",
          variant: "secondary" as const
        };
      case "completed":
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          text: "处理完成",
          color: "bg-green-500",
          textColor: "text-green-600",
          bgColor: "bg-green-50",
          variant: "default" as const
        };
      case "failed":
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          text: "处理失败",
          color: "bg-red-500",
          textColor: "text-red-600",
          bgColor: "bg-red-50",
          variant: "destructive" as const
        };
    }
  };

  const statusInfo = getStatusInfo(item.processing_status);

  const handleDownload = () => {
    if (item.processed_image_url) {
      download(item.processed_image_url, `${getFileName(item.original_filename)}.png`);
    }
  };

  const canDownload = item.processing_status === "completed" && item.processed_image_url;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="p-6 hover:shadow-md transition-shadow">
        <div className="space-y-4">
          {/* 头部信息 */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileImage className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-lg">{item.original_filename}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(item.created_at)}</span>
                  </div>
                  {item.processing_time_ms && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatProcessingTime(item.processing_time_ms)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={statusInfo.variant} className="gap-1">
                {statusInfo.icon}
                {statusInfo.text}
              </Badge>
            </div>
          </div>

          {/* 图片展示区域 */}
          {(item.original_image_url || item.processed_image_url) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 原图 */}
              {item.original_image_url && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">原图</h4>
                  <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden border">
                    <Image
                      src={item.original_image_url}
                      alt="原图"
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                </div>
              )}

              {/* 处理后的图片 */}
              {item.processed_image_url && item.processing_status === "completed" && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">处理结果</h4>
                  <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden border">
                    <Image
                      src={item.processed_image_url}
                      alt="处理结果"
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                </div>
              )}

              {/* 处理中状态 */}
              {item.processing_status === "processing" && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">处理结果</h4>
                  <div className="aspect-square bg-gray-50 rounded-lg border flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
                      <p className="text-sm text-muted-foreground">正在处理中...</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 错误信息 */}
          {item.processing_status === "failed" && item.error_message && (
            <div className={`text-sm p-3 rounded-lg ${statusInfo.bgColor} ${statusInfo.textColor}`}>
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{item.error_message}</span>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t">
            {item.original_image_url && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                {showPreview ? "收起" : "预览"}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={!canDownload}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              下载结果
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}