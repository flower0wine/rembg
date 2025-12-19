/**
 * Image comparison view with slider
 */

"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ReactCompareSlider } from "react-compare-slider";

interface ComparisonViewProps {
  originalImage: string;
  processedImage: string;
  checkeredBg: string;
  width: number;
  height: number;
}

export function ComparisonView({
  originalImage,
  processedImage,
  checkeredBg,
  width,
  height,
}: ComparisonViewProps) {
  return (
    <motion.div
      key="completed"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative"
      style={{ width, height }}
    >
      <ReactCompareSlider
        itemOne={(
          <div
            className="relative w-full h-full"
            style={{
              backgroundImage: `url(${checkeredBg})`,
              backgroundSize: "cover",
            }}
          >
            <Image
              src={originalImage}
              alt="原图"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        )}
        itemTwo={(
          <div
            className="relative w-full h-full"
            style={{
              backgroundImage: `url(${checkeredBg})`,
              backgroundSize: "cover",
            }}
          >
            <Image
              src={processedImage}
              alt="处理后"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        )}
        position={50}
        style={{ width, height }}
      />
    </motion.div>
  );
}
