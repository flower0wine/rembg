"use client";

/**
 * 全屏拖拽导入图片组件
 * 包裹子元素，当用户拖拽文件到页面任何位置时显示全屏拖拽区域
 * 可以独立使用，也可以通过 FullscreenDropProvider 在全局使用
 */

import type { ReactNode } from "react";
import type { UploadError } from "./types";
import { AnimatePresence, motion } from "framer-motion";
import { ImagePlus, Upload } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useFullscreenDrop } from "@/components/providers/fullscreen-drop-provider";
import { ACCEPTED_IMAGE_TYPE_NAMES, ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface FullscreenDropZoneProps {
  children: ReactNode;
  onFilesSelected?: (files: File[]) => void;
  onError?: (error: UploadError) => void;
  disabled?: boolean;
}

export function FullscreenDropZone({
  children,
  onFilesSelected: onFilesSelectedProp,
  onError: onErrorProp,
  disabled: disabledProp = false,
}: FullscreenDropZoneProps) {
  const context = useFullscreenDrop();

  // 优先使用 props，如果没有则使用 context
  const onFilesSelected = onFilesSelectedProp || context.onFilesSelected;
  const onError = onErrorProp || context.onError;
  const disabled = disabledProp || context.disabled || false;

  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  // 验证文件
  const validateFiles = useCallback((files: File[]): File[] => {
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
  }, [onError]);

  // 处理文件
  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0 || disabled || !onFilesSelected)
        return;

      const fileArray = Array.from(files);
      const validFiles = validateFiles(fileArray);

      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    },
    [onFilesSelected, validateFiles, disabled]
  );

  // 全局拖拽事件处理
  useEffect(() => {
    if (disabled || !onFilesSelected)
      return;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // 检查是否包含文件
      if (e.dataTransfer?.types.includes("Files")) {
        setDragCounter(prev => prev + 1);
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      setDragCounter((prev) => {
        const newCounter = prev - 1;
        if (newCounter === 0) {
          setIsDragging(false);
        }
        return newCounter;
      });
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      setIsDragging(false);
      setDragCounter(0);

      handleFiles(e.dataTransfer?.files || null);
    };

    // 添加全局事件监听
    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, [handleFiles, disabled, onFilesSelected]);

  return (
    <>
      {/* 子元素内容 */}
      {children}

      {/* 全屏拖拽覆盖层 */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            {/* 背景遮罩 */}
            <motion.div
              className="absolute inset-0 bg-background/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* 主内容区域 */}
            <motion.div
              className="relative z-10 flex flex-col items-center gap-8 max-w-2xl mx-auto px-8"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
              {/* 虚线边框容器 */}
              <motion.div
                className="relative w-full rounded-3xl border-4 border-dashed border-primary/50 p-16"
                animate={{
                  borderColor: [
                    "hsl(var(--primary) / 0.3)",
                    "hsl(var(--primary) / 0.6)",
                    "hsl(var(--primary) / 0.3)",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {/* 角落装饰 - 带圆角端点的 L 形（无旋转版，更稳定） */}
                {[
                  // 左上角
                  { pos: "-top-20 -left-20", horizontal: "w-8 h-1", hPos: "left-0 top-0", vertical: "w-1 h-8", vPos: "left-0 top-0" },
                  // 右上角
                  { pos: "-top-20 -right-20", horizontal: "w-8 h-1", hPos: "right-0 top-0", vertical: "w-1 h-8", vPos: "right-0 top-0" },
                  // 左下角
                  { pos: "-bottom-20 -left-20", horizontal: "w-8 h-1", hPos: "left-0 bottom-0", vertical: "w-1 h-8", vPos: "left-0 bottom-0" },
                  // 右下角
                  { pos: "-bottom-20 -right-20", horizontal: "w-8 h-1", hPos: "right-0 bottom-0", vertical: "w-1 h-8", vPos: "right-0 bottom-0" },
                ].map(({ pos, horizontal, hPos, vertical, vPos }, i) => (
                  <motion.div
                    key={i}
                    className={cn("absolute size-8", pos)} // 容器固定 8x8，负责定位到角落
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  >
                    {/* 横条 */}
                    <div className={cn("absolute bg-primary rounded-full", horizontal, hPos)} />
                    {/* 竖条 */}
                    <div className={cn("absolute bg-primary rounded-full", vertical, vPos)} />
                  </motion.div>
                ))}

                {/* 图标和文字 */}
                <div className="flex flex-col items-center gap-6 text-center">
                  {/* 图标容器 */}
                  <motion.div
                    className="relative"
                    animate={{
                      y: [0, -12, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    {/* 图标光环 */}
                    {[...Array.from({ length: 3 })].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute inset-0 rounded-full border-2 border-primary/30 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                        style={{
                          width: 120 + i * 20,
                          height: 120 + i * 20,
                        }}
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 0, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.4,
                          ease: "easeOut",
                        }}
                      />
                    ))}

                    {/* 主图标 */}
                    <motion.div
                      className="relative rounded-full bg-primary/10 p-8 backdrop-blur-sm"
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <Upload className="size-16 text-primary" strokeWidth={2} />

                      {[...Array.from({ length: 6 })].map((_, i) => {
                        // 计算圆周上的角度
                        const angle = (i * Math.PI * 2) / 6;

                        // 初始位置：距离中心 30px，方向与最终方向一致
                        const initialX = Math.cos(angle) * 30;
                        const initialY = Math.sin(angle) * 30;

                        // 最终位置：距离中心 300px
                        const finalX = Math.cos(angle) * 100;
                        const finalY = Math.sin(angle) * 100;

                        return (
                          <motion.div
                            key={i}
                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                            initial={{
                              x: initialX,
                              y: initialY,
                              opacity: 0,
                              scale: 0,
                            }}
                            animate={{
                              x: finalX,
                              y: finalY,
                              opacity: [0, 1, 0],
                              scale: [0.8, 1.2, 0.5],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: i * 0.2,
                              ease: "easeOut",
                            }}
                          >
                            <ImagePlus className="size-6 text-primary/60" />
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  </motion.div>

                  {/* 文字内容 */}
                  <motion.div
                    className="space-y-3"
                    animate={{
                      opacity: [0.8, 1, 0.8],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <h2 className="text-4xl font-bold text-primary">
                      释放以上传图片
                    </h2>
                    <p className="text-xl text-muted-foreground">
                      支持
                      {" "}
                      {ACCEPTED_IMAGE_TYPE_NAMES.join("、")}
                      {" "}
                      格式
                    </p>
                    <p className="text-sm text-muted-foreground">
                      单个文件最大 10MB，可同时上传多个文件
                    </p>
                  </motion.div>
                </div>
              </motion.div>

              {/* 底部提示 */}
              <motion.div
                className="flex items-center gap-2 text-sm text-muted-foreground"
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="size-2 rounded-full bg-primary animate-pulse" />
                <span>拖拽文件到此处即可上传</span>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
