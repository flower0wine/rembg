"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createCheckeredBackground, getImageDimensions } from "@/lib/utils/canvas.util";

interface CheckeredBackgroundProps {
  imageUrl: string;
}

export function CheckeredBackground({ imageUrl }: CheckeredBackgroundProps) {
  const [checkeredBg, setCheckeredBg] = useState<string>("");

  useEffect(() => {
    getImageDimensions(imageUrl)
      .then(({ width, height }) => {
        const bg = createCheckeredBackground(width, height, 10);
        setCheckeredBg(bg);
      })
      .catch(console.error);
  }, [imageUrl]);

  if (!checkeredBg)
    return null;

  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Image
        src={checkeredBg}
        alt="checkered background"
        fill
        className="object-contain"
        unoptimized
      />
    </motion.div>
  );
}
