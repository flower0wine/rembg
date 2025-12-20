"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";
import { cn } from "@/lib/utils";

interface ImageDisplayProps {
  processedImageUrl?: string;
  alt: string;
  isProcessing: boolean;
  originalImageUrl: string;
  onDimensionsChange?: (width: number, height: number) => void;
}

export function ImageDisplay({
  processedImageUrl,
  alt,
  isProcessing,
  originalImageUrl,
  onDimensionsChange,
}: ImageDisplayProps) {
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => {
      setDimensions({ width: img.width, height: img.height });
      onDimensionsChange?.(img.width, img.height);
    };
    img.src = processedImageUrl || originalImageUrl;
  }, [processedImageUrl, originalImageUrl, onDimensionsChange]);

  if (processedImageUrl && dimensions) {
    return (
      <motion.div
        className="w-full"
        style={{ aspectRatio: `${dimensions.width} / ${dimensions.height}` }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <ReactCompareSlider
          itemOne={(
            <ReactCompareSliderImage
              src={processedImageUrl}
              alt={`${alt}-处理后`}
              style={{ objectFit: "contain" }}
            />
          )}
          itemTwo={(
            <ReactCompareSliderImage
              src={originalImageUrl}
              alt={`${alt}-原图`}
              style={{ objectFit: "contain" }}
            />
          )}
          className="h-full w-full"
          style={{ height: "100%", width: "100%" }}
        />
      </motion.div>
    );
  }

  // 默认单图显示
  if (!dimensions) {
    return (
      <motion.div
        className="w-full min-h-[400px] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-muted-foreground">加载中...</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="w-full"
      style={{ aspectRatio: `${dimensions.width} / ${dimensions.height}` }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Image
        src={originalImageUrl}
        alt={alt}
        width={dimensions.width}
        height={dimensions.height}
        className={cn(
          "w-full h-full object-contain transition-all duration-500",
          isProcessing && "opacity-40 blur-sm"
        )}
        unoptimized
      />
    </motion.div>
  );
}
