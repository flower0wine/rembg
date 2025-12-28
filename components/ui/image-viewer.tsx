"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  ReactCompareSlider,
} from "react-compare-slider";
import { cn } from "@/lib/utils";
import "./image-viewer.css";

interface ImageViewerProps {
  // 左侧图片
  imageOne?: string;
  // 右侧图片
  imageTwo: string;
  imageOneAlt: string;
  imageTwoAlt: string;
  /** 是否显示棋盘格背景（透明图片时有用） */
  showCheckeredBackground?: boolean;
  /** 最小高度 */
  minHeight?: number;
  /** 自定义类名 */
  className?: string;
  defaultDimensions?: { width: number; height: number };

}

function ImageViewer({
  imageOne,
  imageTwo,
  imageOneAlt,
  imageTwoAlt,
  showCheckeredBackground = false,
  className,
  defaultDimensions = { width: 0, height: 0 },
}: ImageViewerProps) {
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => {
      setDimensions({ width: img.width, height: img.height });
    };
    img.src = imageTwo;
  }, [imageTwo]);

  const dimensionsWidth = dimensions ? dimensions.width : defaultDimensions.width;
  const dimensionsHeight = dimensions ? dimensions.height : defaultDimensions.height;

  const containerStyle = {
    aspectRatio: `${dimensionsWidth} / ${dimensionsHeight}`,
  };

  return (
    <AnimatePresence mode="wait">
      {imageOne
        ? (
          // 对比模式
            <motion.div
              key="compare-mode"
              className={cn(
                "relative",
                showCheckeredBackground && "checkered-background",
                className
              )}
              style={containerStyle}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <ReactCompareSlider
                itemOne={(
                  <Image
                    src={imageOne}
                    alt={imageOneAlt}
                    width={dimensionsWidth}
                    height={dimensionsHeight}
                    className="w-full h-full object-contain"
                    unoptimized
                  />
                )}
                itemTwo={(
                  <Image
                    src={imageTwo}
                    alt={imageTwoAlt}
                    width={dimensionsWidth}
                    height={dimensionsHeight}
                    className="w-full h-full object-contain"
                    unoptimized
                  />
                )}
                className="h-full w-full"
                style={{ height: "100%", width: "100%" }}
              />
            </motion.div>
          )
        : (
          // 单图模式
            <motion.div
              key="single-mode"
              className={cn(
                "relative w-full",
                showCheckeredBackground && "checkered-background",
                className
              )}
              style={containerStyle}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Image
                src={imageTwo}
                alt={imageTwoAlt}
                width={dimensionsWidth}
                height={dimensionsHeight}
                className={cn(
                  "w-full h-full object-contain",
                )}
                unoptimized
              />
            </motion.div>
          )}
    </AnimatePresence>
  );
}

export { ImageViewer };
export type { ImageViewerProps };