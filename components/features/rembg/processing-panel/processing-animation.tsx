"use client";

import { motion } from "framer-motion";
import { ImageStatus } from "../types";

interface ProcessingAnimationProps {
  status: ImageStatus;
}

export function ProcessingAnimation({ status }: ProcessingAnimationProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/30 backdrop-blur-[2px]">
      <motion.div
        className="relative"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* 最外层光环 */}
        <motion.div
          className="absolute -inset-12 rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(var(--primary) / 0.1) 0%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* 外圈旋转 - 虚线效果 */}
        <motion.div
          className="size-24 rounded-full border-[3px] border-dashed border-primary/30"
          animate={{ rotate: 360 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* 中圈旋转 */}
        <motion.div
          className="absolute inset-3 rounded-full border-4 border-transparent border-t-primary border-r-primary/50"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* 内圈反向旋转 */}
        <motion.div
          className="absolute inset-6 rounded-full border-[3px] border-transparent border-b-primary/70 border-l-primary/40"
          animate={{ rotate: -360 }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* 中心脉冲圆 */}
        <motion.div
          className="absolute inset-0 m-auto size-10 rounded-full bg-primary/80 shadow-lg shadow-primary/50"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* 中心点 */}
        <motion.div
          className="absolute inset-0 m-auto size-4 rounded-full bg-background"
          animate={{
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* 粒子效果 */}
        {[...Array.from({ length: 8 })].map((_, i) => (
          <motion.div
            key={i}
            className="absolute size-1.5 rounded-full bg-primary"
            style={{
              top: "50%",
              left: "50%",
              marginTop: "-3px",
              marginLeft: "-3px",
            }}
            animate={{
              x: [0, Math.cos((i * Math.PI * 2) / 8) * 50],
              y: [0, Math.sin((i * Math.PI * 2) / 8) * 50],
              opacity: [1, 0],
              scale: [1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeOut",
            }}
          />
        ))}
      </motion.div>

      {/* 处理状态文字 */}
      <motion.div
        className="absolute bottom-1/4 left-1/2 -translate-x-1/2 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.p
          className="text-sm font-medium text-foreground/80"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {status === ImageStatus.Verify && "验证请求中..."}
          {status === ImageStatus.Processing && "处理中..."}
          {status === ImageStatus.Waiting && "等待中..."}
        </motion.p>
      </motion.div>
    </div>
  );
}
