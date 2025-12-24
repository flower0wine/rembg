"use client";

import type { Tables } from "@/lib/supabase/database.types";
import { motion } from "framer-motion";
import Masonry from "react-masonry-css";
import { HistoryItem } from "./history-item";
import "./masonry.css";

interface HistoryListProps {
  items: Tables<"processing_history">[];
}

export function HistoryList({ items }: HistoryListProps) {
  // 响应式断点配置
  const breakpointColumnsObj = {
    default: 4,
    1536: 4, // xl: 4列
    1280: 3, // lg: 3列
    1024: 2, // md: 2列
    640: 1, // sm: 1列
  };

  return (
    <div>
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="masonry-grid"
        columnClassName="masonry-grid-column"
      >
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * 0.05,
              duration: 0.3,
            }}
          >
            <HistoryItem item={item} />
          </motion.div>
        ))}
      </Masonry>
    </div>
  );
}
