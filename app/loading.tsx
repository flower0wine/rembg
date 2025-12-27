"use client";

import { motion } from "framer-motion";

export default function Loading() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col items-center gap-6"
      >
        {/* 主加载动画 */}
        <div className="relative w-20 h-20">
          {/* 外圈旋转 */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-primary"
          />

          {/* 中圈反向旋转 */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 rounded-full border-2 border-transparent border-b-primary/60 border-l-primary/60"
          />

          {/* 内圈脉冲 */}
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-4 rounded-full bg-linear-to-br from-primary/20 to-primary/5"
          />

          {/* 中心点 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-2 h-2 rounded-full bg-primary"
            />
          </div>
        </div>

        {/* 加载文本 */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-center"
        >
          <p className="text-sm font-medium text-foreground">加载中</p>
          <div className="flex gap-1 justify-center mt-2">
            {[0, 150, 300].map((delay, index) => (
              <motion.span
                key={index}
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: delay / 1000,
                  ease: "easeInOut",
                }}
                className="w-1.5 h-1.5 rounded-full bg-primary"
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
