/**
 * Main image viewer with processing overlay and image comparison
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import {
  calculateFitDimensions,
  createCheckeredBackground,
  getImageDimensions,
} from "@/lib/utils/canvas";
import { useImageSelection } from "../../hooks";
import { currentImageAtom } from "../../store";
import { ComparisonView } from "./comparison-view";
import { NavigationButtons } from "./navigation-buttons";
import { ProcessingOverlay } from "./processing-overlay";
import { SimpleImageView } from "./simple-image-view";

interface ImageViewerProps {
  showNavigation?: boolean;
}

export function ImageViewer({ showNavigation = true }: ImageViewerProps) {
  const [currentImage] = useAtom(currentImageAtom);
  const { selectPrevious, selectNext } = useImageSelection();
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [checkeredBg, setCheckeredBg] = useState<string>("");

  // 获取图片尺寸并创建棋盘格背景
  useEffect(() => {
    if (!currentImage?.originalImage) {
      setImageDimensions(null);
      setCheckeredBg("");
      return;
    }

    getImageDimensions(currentImage.originalImage)
      .then((dims) => {
        // 计算适应 600px 宽度的尺寸
        const fitted = calculateFitDimensions(dims.width, dims.height, 600);
        setImageDimensions(fitted);

        // 创建棋盘格背景
        const bg = createCheckeredBackground(fitted.width, fitted.height, 10);
        setCheckeredBg(bg);
      })
      .catch((error) => {
        console.error("Failed to load image dimensions:", error);
        // 使用默认尺寸
        setImageDimensions({ width: 600, height: 400 });
      });
  }, [currentImage?.originalImage, currentImage?.id]);

  const renderMainImage = () => {
    if (!currentImage || !imageDimensions)
      return null;

    // 处理中状态
    if (currentImage.status === "processing") {
      return (
        <ProcessingOverlay
          imageUrl={currentImage.originalImage}
          width={imageDimensions.width}
          height={imageDimensions.height}
        />
      );
    }

    // 处理完成 - 使用对比滑块和棋盘格背景
    if (currentImage.processedImage && checkeredBg) {
      return (
        <ComparisonView
          originalImage={currentImage.originalImage}
          processedImage={currentImage.processedImage}
          checkeredBg={checkeredBg}
          width={imageDimensions.width}
          height={imageDimensions.height}
        />
      );
    }

    // 仅原图
    return (
      <SimpleImageView
        imageUrl={currentImage.originalImage}
        width={imageDimensions.width}
        height={imageDimensions.height}
      />
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="relative mx-auto overflow-hidden rounded-lg border bg-card shadow-sm"
      style={{ maxWidth: "600px" }}
    >
      <div className="relative flex items-center justify-center bg-muted">
        <AnimatePresence mode="wait">{renderMainImage()}</AnimatePresence>
      </div>

      {showNavigation && (
        <NavigationButtons
          onPrevious={selectPrevious}
          onNext={selectNext}
        />
      )}
    </motion.div>
  );
}
