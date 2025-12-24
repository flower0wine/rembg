"use client";

/**
 * 处理中面板组件 - 显示图片处理状态
 */

import type { ImageItem } from "../types";
import { motion } from "framer-motion";
import { ImageViewer } from "@/components/ui/image-viewer";
import { cn } from "@/lib/utils";
import { CompletionAnimation } from "./completion-animation";
import { ErrorDisplay } from "./error-display";
import { ProcessingAnimation } from "./processing-animation";
import { ProgressBar } from "./progress-bar";

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
        "relative w-full rounded-xl overflow-hidden",
        className
      )}
    >
      <ImageViewer
        className={cn(isProcessing && "opacity-40 blur-sm")}
        imageOne={image.processedImageUrl}
        imageTwo={image.originImageUrl}
        imageOneAlt={`${image.originImageFile.name}-original`}
        imageTwoAlt={`${image.originImageFile.name}-processed`}
        showCheckeredBackground={isCompleted && !!image.processedImageUrl}
      />


      {/* 处理中动效 */}
      {isProcessing && (
        <ProcessingAnimation status={image.status as "uploading" | "processing"} />
      )}

      {/* 完成动效 */}
      {isCompleted && <CompletionAnimation />}

      {/* 错误状态 */}
      {isError && <ErrorDisplay message={image.error?.message} />}

      {/* 进度指示器 */}
      {isProcessing && <ProgressBar progress={image.progress} />}
    </div>
  );
}
