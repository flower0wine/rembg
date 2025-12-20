"use client";

/**
 * 处理中面板组件 - 显示图片处理状态
 */

import type { ImageItem } from "./types";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProcessingPanelProps {
  image: ImageItem;
  className?: string;
}

export function ProcessingPanel({ image, className }: ProcessingPanelProps) {
  const isProcessing = image.status === "processing" || image.status === "uploading";
  const isCompleted = image.status === "completed";
  const isError = image.status === "error";

  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-xl overflow-hidden",
        "min-h-[400px]",
        className
      )}
    >
      {/* 背景图片 */}
      <motion.div
        className=""
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Image
          src={isCompleted && image.processedImage ? image.processedImage : image.preview}
          alt={image.file.name}
          fill
          className={cn(
            "object-contain transition-all duration-500",
            isProcessing && "opacity-40 blur-sm"
          )}
          unoptimized
        />
      </motion.div>

      {/* 动态渐变背景 */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            "radial-gradient(circle at 20% 50%, hsl(var(--primary) / 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 50%, hsl(var(--primary) / 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 50% 80%, hsl(var(--primary) / 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 50% 20%, hsl(var(--primary) / 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 50%, hsl(var(--primary) / 0.15) 0%, transparent 50%)",
          ],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* 网格背景 */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
        }}
      />



      {/* 处理中动效 */}
      {isProcessing && (
        <div className="absolute inset-0 flex items-center justify-center backdrop-blur-[2px]">
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* 最外层光环 */}
            <motion.div
              className="absolute -inset-12 rounded-full"
              style={{
                background: "radial-gradient(circle, hsl(var(--primary) / 0.1) 0%, transparent 70%)",
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* 外圈旋转 - 虚线效果 */}
            <motion.div
              className="size-24 rounded-full border-[3px] border-dashed border-primary/30"
              animate={{ rotate: 360 }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
            />

            {/* 中圈旋转 */}
            <motion.div
              className="absolute inset-3 rounded-full border-4 border-transparent border-t-primary border-r-primary/50"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "linear",
              }}
            />

            {/* 内圈反向旋转 */}
            <motion.div
              className="absolute inset-6 rounded-full border-[3px] border-transparent border-b-primary/70 border-l-primary/40"
              animate={{ rotate: -360 }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "linear",
              }}
            />

            {/* 中心脉冲圆 */}
            <motion.div
              className="absolute inset-0 m-auto size-10 rounded-full bg-primary/80 shadow-lg shadow-primary/50"
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* 中心点 */}
            <motion.div
              className="absolute inset-0 m-auto size-4 rounded-full bg-background"
              animate={{
                scale: [1, 0.9, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* 粒子效果 */}
            {[...Array.from({ length: 8 })].map((_, i) => (
              <motion.div
                key={i}
                className="absolute size-1.5 rounded-full bg-primary"
                style={{
                  top: "50%",
                  left: "50%",
                  marginTop: "-3px",
                  marginLeft: "-3px",
                }}
                animate={{
                  x: [0, Math.cos((i * Math.PI * 2) / 8) * 50],
                  y: [0, Math.sin((i * Math.PI * 2) / 8) * 50],
                  opacity: [1, 0],
                  scale: [1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeOut",
                }}
              />
            ))}
          </motion.div>

          {/* 处理状态文字 */}
          <motion.div
            className="absolute bottom-1/3 left-1/2 -translate-x-1/2 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.p
              className="text-sm font-medium text-foreground/80"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {image.status === "uploading" ? "上传中..." : "处理中..."}
            </motion.p>
          </motion.div>
        </div>
      )}

      {/* 完成动效 */}
      {isCompleted && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.div
            className="absolute inset-0 bg-primary/20"
            initial={{ scale: 0, borderRadius: "50%" }}
            animate={{ scale: 3, borderRadius: "0%" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </motion.div>
      )}

      {/* 错误状态 */}
      {isError && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-destructive/10 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="text-center space-y-2 p-6 bg-background/80 rounded-lg shadow-lg"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="size-12 mx-auto rounded-full bg-destructive/20 flex items-center justify-center"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              <svg
                className="size-6 text-destructive"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </motion.div>
            <p className="text-destructive font-medium">处理失败</p>
            {image.error && (
              <p className="text-sm text-muted-foreground max-w-xs">{image.error}</p>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* 进度指示器 */}
      {isProcessing && image.progress > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-muted/50 backdrop-blur-sm">
          <motion.div
            className="h-full bg-linear-to-r from-primary via-primary/80 to-primary relative overflow-hidden"
            initial={{ width: 0 }}
            animate={{ width: `${image.progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* 进度条光泽效果 */}
            <motion.div
              className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent"
              animate={{
                x: ["-100%", "200%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}
