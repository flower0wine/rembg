"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  progress: number;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  if (progress <= 0)
    return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-muted/50 backdrop-blur-sm">
      <motion.div
        className="h-full bg-linear-to-r from-primary via-primary/80 to-primary relative overflow-hidden"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
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
  );
}
