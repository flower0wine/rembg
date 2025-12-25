"use client";

/**
 * 上传面板组件 - 支持点击和拖拽上传
 */

import type { UploadError } from "./types";
import { motion } from "framer-motion";
import { Upload } from "lucide-react";
import { useCallback, useState } from "react";
import { ACCEPTED_IMAGE_TYPE_NAMES, ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ImageFileInput, useImageFileInput } from "./image-file-input";

interface UploadPanelProps {
  onFilesSelected: (files: File[]) => void;
  onError?: (error: UploadError) => void;
  className?: string;
}

export function UploadPanel({
  onFilesSelected,
  onError,
  className,
}: UploadPanelProps) {
  const [isDragging, setIsDragging] = useState(false);

  // 验证文件
  const validateFiles = (files: File[]): File[] => {
    const validFiles: File[] = [];

    for (const file of files) {
      // 检查文件类型
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type as any)) {
        onError?.({
          type: "type",
          message: `${file.name} 不是支持的图片格式`,
        });
        continue;
      }

      // 检查文件大小
      if (file.size > MAX_FILE_SIZE) {
        onError?.({
          type: "size",
          message: `${file.name} 超过 ${MAX_FILE_SIZE / 1024 / 1024}MB 限制`,
        });
        continue;
      }

      validFiles.push(file);
    }

    return validFiles;
  };

  // 处理文件选择
  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0)
        return;

      const fileArray = Array.from(files);
      const validFiles = validateFiles(fileArray);

      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    },
    [onFilesSelected]
  );

  const { inputRef, openFileDialog } = useImageFileInput(handleFiles);

  // 拖拽事件
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    handleFiles(e.dataTransfer.files);
  };

  return (
    <motion.div
      onClick={openFileDialog}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden",
        "min-h-[400px] p-8",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-primary/50",
        className
      )}
      animate={{
        scale: isDragging ? 1.02 : 1,
      }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* 动态渐变背景 */}
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          background: isDragging
            ? [
                "radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.2) 0%, transparent 50%)",
                "radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.3) 0%, transparent 60%)",
              ]
            : [
                "radial-gradient(circle at 20% 30%, hsl(var(--primary) / 0.05) 0%, transparent 50%)",
                "radial-gradient(circle at 80% 70%, hsl(var(--primary) / 0.05) 0%, transparent 50%)",
                "radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.05) 0%, transparent 50%)",
                "radial-gradient(circle at 20% 30%, hsl(var(--primary) / 0.05) 0%, transparent 50%)",
              ],
        }}
        transition={{
          duration: isDragging ? 1 : 8,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* 网格背景 */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: "30px 30px",
        }}
      />

      {/* 拖拽时的粒子效果 */}
      {isDragging && (
        <>
          {[...Array.from({ length: 12 })].map((_, i) => (
            <motion.div
              key={i}
              className="absolute size-2 rounded-full bg-primary/40"
              initial={{
                x: "50%",
                y: "50%",
                opacity: 0,
              }}
              animate={{
                x: `${50 + Math.cos((i * Math.PI * 2) / 12) * 40}%`,
                y: `${50 + Math.sin((i * Math.PI * 2) / 12) * 40}%`,
                opacity: [0, 1, 0],
                scale: [0, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeOut",
              }}
            />
          ))}
        </>
      )}

      <ImageFileInput
        multiple
        inputRef={inputRef}
        onChange={handleFiles}
      />

      <div className="flex flex-col items-center gap-4 text-center relative z-10">
        <motion.div
          className={cn(
            "rounded-full p-6 transition-colors relative",
            isDragging ? "bg-primary/10" : "bg-muted"
          )}
          animate={{
            scale: isDragging ? [1, 1.1, 1] : 1,
          }}
          transition={{
            duration: 0.6,
            repeat: isDragging ? Infinity : 0,
          }}
        >
          {/* 图标光环效果 */}
          {isDragging && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-primary/30"
              animate={{
                scale: [1, 1.5],
                opacity: [0.5, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          )}

          <motion.div
            animate={{
              y: isDragging ? [0, -8, 0] : 0,
            }}
            transition={{
              duration: 1,
              repeat: isDragging ? Infinity : 0,
              ease: "easeInOut",
            }}
          >
            <Upload
              className={cn(
                "size-12 transition-colors",
                isDragging ? "text-primary" : "text-muted-foreground"
              )}
            />
          </motion.div>
        </motion.div>

        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p
            className={cn(
              "text-lg font-medium transition-colors duration-300",
              isDragging ? "text-primary" : "text-foreground"
            )}
          >
            {isDragging ? "释放以上传图片" : "点击或拖拽上传图片"}
          </p>
          <p className="text-sm text-muted-foreground">
            支持
            {" "}
            {ACCEPTED_IMAGE_TYPE_NAMES.join("、")}
            {" "}
            格式，单个文件最大 10MB
          </p>
          <motion.p
            className="text-xs text-muted-foreground"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            可同时上传多个文件
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  );
}
