"use client";

import { motion } from "framer-motion";

const proFeatures = [
  "每月 500 次使用额度",
  "25MB 最大文件大小",
  "批量处理（50 个文件）",
  "优先技术支持",
  "高级分析功能"
];

export function ProFeaturesList() {
  return (
    <motion.div
      key="pro-features"
      initial={{ opacity: 0, height: 0, y: -10 }}
      animate={{
        opacity: 1,
        height: "auto",
        y: 0,
        transition: {
          height: { duration: 0.4, ease: "easeOut" },
          opacity: { duration: 0.3, delay: 0.1 },
          y: { duration: 0.3, delay: 0.1 }
        }
      }}
      exit={{
        opacity: 0,
        height: 0,
        y: -10,
        transition: {
          height: { duration: 0.3, ease: "easeIn" },
          opacity: { duration: 0.2 },
          y: { duration: 0.2 }
        }
      }}
      className="bg-primary/5 border border-primary/20 rounded-lg p-4 overflow-hidden"
    >
      <h3 className="font-semibold text-primary mb-2">Pro 计划特权</h3>
      <ul className="text-sm text-muted-foreground space-y-1 text-left">
        {proFeatures.map((feature, index) => (
          <motion.li
            key={feature}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            •
            {" "}
            {feature}
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}