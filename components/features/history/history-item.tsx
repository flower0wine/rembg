"use client";

import type { ProcessingHistory } from "@/lib/types";
import { motion } from "framer-motion";
import { Calendar, Download, FileImage, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface HistoryItemProps {
  item: ProcessingHistory;
  onDownload: (item: ProcessingHistory) => void;
  onDelete: (id: string) => void;
  className?: string;
}

export function HistoryItem({
  item,
  onDownload,
  onDelete,
  className,
}: HistoryItemProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleDeleteClick = () => {
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    onDelete(item.id);
    setDeleteOpen(false);
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024)
      return `${bytes} B`;
    if (bytes < 1024 * 1024)
      return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={className}
      >
        <Card className={cn("overflow-hidden hover:shadow-md transition-shadow")}>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {/* Image Previews */}
              <div className="flex gap-2 shrink-0">
                {/* Original Image */}
                <div className="relative h-20 w-20 overflow-hidden rounded-md border bg-muted">
                  <Image
                    src={item.original_image_url}
                    alt="Original"
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>

                {/* Processed Image */}
                <div className="relative h-20 w-20 overflow-hidden rounded-md border checkered-background">
                  <Image
                    src={item.processed_image_url}
                    alt="Processed"
                    fill
                    className="object-contain"
                    sizes="80px"
                  />
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2">
                  <FileImage className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate" title={item.original_filename}>
                      {item.original_filename}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(item.created_at)}
                      </span>
                      <span>{formatFileSize(item.file_size)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDownload(item)}
                  title="下载处理后的图片"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">下载</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteClick}
                  title="删除记录"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除 "
              {item.original_filename}
              " 的处理记录吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "destructive" })}
              onClick={confirmDelete}
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
