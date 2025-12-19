/**
 * Processing overlay with animation and timer
 */

"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ProcessingTimer } from "./processing-timer";

interface ProcessingOverlayProps {
  imageUrl: string;
  width: number;
  height: number;
}

export function ProcessingOverlay({
  imageUrl,
  width,
  height,
}: ProcessingOverlayProps) {
  return (
    <motion.div
      key="processing"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative"
      style={{ width, height }}
    >
      <motion.div
        className="relative w-full h-full"
        animate={{
          opacity: [1, 0.7, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Image
          src={imageUrl}
          alt="Processing"
          fill
          className="object-contain"
          unoptimized
        />
      </motion.div>

      <motion.div
        className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent"
        animate={{
          x: ["0%", "100%"],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-3 bg-black/50 px-6 py-4 rounded-lg backdrop-blur-sm"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="flex gap-2">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="h-3 w-3 rounded-full bg-white/80 shadow-lg"
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
          <p className="text-sm font-medium text-white drop-shadow-lg">
            正在处理中...
          </p>
          <ProcessingTimer estimatedTime={45} />
        </motion.div>
      </div>
    </motion.div>
  );
}
