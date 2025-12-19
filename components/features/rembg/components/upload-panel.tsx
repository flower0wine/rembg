/**
 * Upload panel shown when no images are uploaded
 */

"use client";

import { motion } from "framer-motion";
import { useAtom } from "jotai";
import { Link as LinkIcon, Upload } from "lucide-react";
import React, { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ACCEPTED_IMAGE_TYPES } from "@/lib/types";
import { cn } from "@/lib/utils";
import { validateFile } from "@/lib/utils/validation";
import { useImageActions } from "../hooks";
import { isProcessingAtom } from "../store";

export function UploadPanel() {
  const [isProcessing] = useAtom(isProcessingAtom);
  const { processBatch, processImage } = useImageActions();
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [isSubmittingUrl, setIsSubmittingUrl] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isProcessing)
        setIsDragging(true);
    },
    [isProcessing]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const target = e.currentTarget;
      const relatedTarget = e.relatedTarget as Node | null;
      if (!relatedTarget || !target.contains(relatedTarget)) {
        setIsDragging(false);
      }
    },
    []
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isProcessing)
        e.dataTransfer.dropEffect = "copy";
    },
    [isProcessing]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (isProcessing)
        return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) {
        toast.error("未检测到文件");
        return;
      }

      const validFiles: File[] = [];
      for (const file of files) {
        const validation = validateFile(file);
        if (validation.success) {
          validFiles.push(file);
        }
        else {
          toast.error(validation.error || "文件验证失败");
        }
      }

      if (validFiles.length > 0) {
        processBatch(validFiles);
      }
    },
    [isProcessing, processBatch]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0)
        return;

      const validFiles: File[] = [];
      for (const file of Array.from(files)) {
        const validation = validateFile(file);
        if (validation.success) {
          validFiles.push(file);
        }
        else {
          toast.error(validation.error || "文件验证失败");
        }
      }

      if (validFiles.length > 0) {
        processBatch(validFiles);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [processBatch]
  );

  const handleUrlSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!urlInput.trim()) {
        toast.error("请输入图片 URL");
        return;
      }

      setIsSubmittingUrl(true);
      try {
        URL.parse(urlInput);
        const urlParts = urlInput.split("/");
        const filename = urlParts[urlParts.length - 1] || "image.png";
        processImage(urlInput, filename);
        setUrlInput("");
      }
      catch {
        toast.error("请输入有效的 URL");
      }
      finally {
        setIsSubmittingUrl(false);
      }
    },
    [urlInput, processImage]
  );

  const handlePanelClick = useCallback(() => {
    if (!isProcessing) {
      fileInputRef.current?.click();
    }
  }, [isProcessing]);

  return (
    <div className="space-y-4">
      {/* Drag and drop area */}
      <motion.div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handlePanelClick}
        initial={false}
        animate={{
          scale: isDragging ? 1.02 : 1,
          borderColor: isDragging
            ? "rgb(59, 130, 246)"
            : "rgb(229, 231, 235)",
        }}
        transition={{
          duration: 0.2,
          ease: "easeInOut",
        }}
        className={cn(
          "relative rounded-lg border-2 border-dashed p-8 transition-colors",
          "flex flex-col items-center justify-center gap-4",
          "min-h-[280px]",
          isDragging && "bg-blue-50 dark:bg-blue-950/20",
          isProcessing && "cursor-not-allowed opacity-50",
          !isProcessing && "cursor-pointer hover:border-gray-300 dark:hover:border-gray-700",
          !isProcessing && !isDragging && "hover:bg-gray-50 dark:hover:bg-gray-950/20"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          onChange={handleFileInputChange}
          disabled={isProcessing}
          className="hidden"
          aria-label="选择图片文件"
        />

        <motion.div
          animate={{
            y: isDragging ? -8 : 0,
            scale: isDragging ? 1.1 : 1,
          }}
          transition={{
            duration: 0.2,
            ease: "easeInOut",
          }}
        >
          <Upload
            className={cn(
              "h-12 w-12 transition-colors",
              isDragging
                ? "text-blue-500"
                : isProcessing
                  ? "text-gray-300 dark:text-gray-700"
                  : "text-gray-400 dark:text-gray-600"
            )}
          />
        </motion.div>

        <div className="text-center">
          <motion.p
            animate={{
              color: isDragging
                ? "rgb(59, 130, 246)"
                : isProcessing
                  ? "rgb(209, 213, 219)"
                  : "rgb(107, 114, 128)",
            }}
            className="text-sm font-medium"
          >
            {isDragging ? "释放以上传图片" : "拖拽图片到此处或点击选择"}
          </motion.p>
          <p
            className={cn(
              "mt-1 text-xs",
              isProcessing
                ? "text-gray-300 dark:text-gray-700"
                : "text-muted-foreground"
            )}
          >
            支持 PNG、JPG、JPEG、WebP 格式，最大 10MB
          </p>
        </div>
      </motion.div>

      {/* URL input section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={cn(
          "rounded-lg border bg-card p-4",
          isProcessing && "opacity-50"
        )}
      >
        <form onSubmit={handleUrlSubmit} className="flex gap-2">
          <div className="flex-1">
            <Input
              type="url"
              placeholder="或输入图片 URL..."
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              disabled={isProcessing || isSubmittingUrl}
              className="h-10"
            />
          </div>
          <Button
            type="submit"
            disabled={isProcessing || isSubmittingUrl || !urlInput.trim()}
            size="sm"
          >
            <LinkIcon className="h-4 w-4" />
            加载
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
