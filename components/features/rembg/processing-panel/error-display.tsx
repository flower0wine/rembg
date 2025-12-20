"use client";

import { motion } from "framer-motion";

interface ErrorDisplayProps {
  message?: string;
}

export function ErrorDisplay({ message }: ErrorDisplayProps) {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center bg-destructive/10 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="text-center space-y-2 p-6 bg-background/80 rounded-lg shadow-lg"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="size-12 mx-auto rounded-full bg-destructive/20 flex items-center justify-center"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          <svg
            className="size-6 text-destructive"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </motion.div>
        <p className="text-destructive font-medium">处理图片失败</p>
        {message && (
          <p className="text-sm text-muted-foreground max-w-xs">{message}</p>
        )}
      </motion.div>
    </motion.div>
  );
}
