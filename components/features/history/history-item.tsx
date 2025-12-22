"use client";

import type { ProcessingHistoryItem } from "./history-client";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { motion } from "framer-motion";
import { Calendar, Download, FileImage, HardDrive } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import "dayjs/locale/zh-cn";

// 配置 dayjs
dayjs.extend(relativeTime);
dayjs.locale("zh-cn");

interface HistoryItemProps {
  item: ProcessingHistoryItem;
}

export function HistoryItem({ item }: HistoryItemProps) {
  const [showDownloadMessage, setShowDownloadMessage] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0)
      return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).fromNow();
  };

  const handleDownload = () => {
    // 由于当前实现中图片URL为空，这里暂时显示提示
    // 后续可以实现实际的下载功能
    setShowDownloadMessage(true);
    setTimeout(() => setShowDownloadMessage(false), 3000);
  };



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
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            {/* 文件名和图标 */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileImage className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-lg">{item.original_filename}</h3>
                <p className="text-sm text-muted-foreground">
                  背景移除处理
                </p>
              </div>
            </div>

            {/* 详细信息 */}
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                <span>{formatFileSize(item.file_size)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(item.created_at)}</span>
              </div>
            </div>

            {/* 处理状态 */}
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-600 font-medium">
                处理完成
              </span>
            </div>

            {/* 下载提示消息 */}
            {showDownloadMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm text-blue-600 bg-blue-50 p-2 rounded"
              >
                下载功能将在后续版本中实现
              </motion.div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              下载
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}