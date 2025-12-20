"use client";

/**
 * 处理中面板组件 - 显示图片处理状态
 */

import type { ImageItem } from "../types";
import { cn } from "@/lib/utils";
import { BackgroundEffects } from "./background-effects";
import { CheckeredBackground } from "./checkered-background";
import { CompletionAnimation } from "./completion-animation";
import { ErrorDisplay } from "./error-display";
import { ImageDisplay } from "./image-display";
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
      {/* 棋盘格底片背景 - 仅在完成时显示 */}
      {isCompleted && image.processedImageUrl && (
        <CheckeredBackground imageUrl={image.processedImageUrl} />
      )}

      {/* 前景图片 */}
      <ImageDisplay
        processedImageUrl={image.processedImageUrl}
        alt={image.originImageFile.name}
        isProcessing={isProcessing}
        originalImageUrl={image.originImageUrl}
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
