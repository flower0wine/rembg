/**
 * Add more images button with drag and drop support
 */

"use client";

import { motion } from "framer-motion";
import { useAtom } from "jotai";
import { Plus } from "lucide-react";
import React, { useCallback, useState } from "react";
import { toast } from "sonner";
import { ACCEPTED_IMAGE_TYPES } from "@/lib/types";
import { cn } from "@/lib/utils";
import { validateFile } from "@/lib/utils/validation";
import { isProcessingAtom } from "../store";

interface AddMoreButtonProps {
  onFilesSelect: (files: File[]) => void;
  disabled?: boolean;
}

export function AddMoreButton({
  onFilesSelect,
  disabled = false,
}: AddMoreButtonProps) {
  const [isProcessing] = useAtom(isProcessingAtom);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback(
    (e: React.DragEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled && !isProcessing)
        setIsDragging(true);
    },
    [disabled, isProcessing]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLButtonElement>) => {
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
    (e: React.DragEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled && !isProcessing)
        e.dataTransfer.dropEffect = "copy";
    },
    [disabled, isProcessing]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled || isProcessing)
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
        onFilesSelect(validFiles);
      }
    },
    [disabled, isProcessing, onFilesSelect]
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
        onFilesSelect(validFiles);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [onFilesSelect]
  );

  const handleClick = useCallback(() => {
    if (!disabled && !isProcessing) {
      fileInputRef.current?.click();
    }
  }, [disabled, isProcessing]);

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        onChange={handleFileInputChange}
        disabled={disabled || isProcessing}
        className="hidden"
        aria-label="选择图片文件"
      />

      <motion.button
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        disabled={disabled || isProcessing}
        className={cn(
          "shrink-0 h-16 w-16 rounded-lg border-2 border-dashed transition-all",
          "flex items-center justify-center",
          isDragging && "border-blue-500 bg-blue-50 dark:bg-blue-950/20",
          !isDragging && !disabled && !isProcessing && "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600",
          !isDragging && !disabled && !isProcessing && "hover:bg-gray-50 dark:hover:bg-gray-950/20",
          (disabled || isProcessing) && "cursor-not-allowed opacity-50 border-gray-200 dark:border-gray-800"
        )}
        aria-label="添加更多图片"
      >
        <motion.div
          animate={{
            scale: isDragging ? 1.2 : 1,
          }}
          transition={{
            duration: 0.2,
          }}
        >
          <Plus
            className={cn(
              "h-6 w-6 transition-colors",
              isDragging && "text-blue-500",
              !isDragging && !disabled && !isProcessing && "text-gray-400 dark:text-gray-600",
              (disabled || isProcessing) && "text-gray-300 dark:text-gray-700"
            )}
          />
        </motion.div>
      </motion.button>
    </>
  );
}
