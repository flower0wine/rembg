/**
 * Simple image view without comparison
 */

"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface SimpleImageViewProps {
  imageUrl: string;
  width: number;
  height: number;
}

export function SimpleImageView({
  imageUrl,
  width,
  height,
}: SimpleImageViewProps) {
  return (
    <motion.div
      key="original"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative"
      style={{ width, height }}
    >
      <Image
        src={imageUrl}
        alt="Original"
        fill
        className="object-contain"
        unoptimized
      />
    </motion.div>
  );
}
