"use client";

import type { ProcessingHistoryItem } from "./history-client";
import { motion } from "framer-motion";
import { HistoryItem } from "./history-item";

interface HistoryListProps {
  items: ProcessingHistoryItem[];
}

export function HistoryList({ items }: HistoryListProps) {
  return (
    <motion.div
      className="space-y-4"
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.05,
          },
        },
      }}
    >
      {items.map(item => (
        <HistoryItem key={item.id} item={item} />
      ))}
    </motion.div>
  );
}
