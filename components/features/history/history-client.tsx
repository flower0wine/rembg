"use client";

import type { Tables } from "@/lib/supabase/database.types";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Masonry from "react-masonry-css";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { HistoryEmpty } from "./history-empty";
import { HistoryItem } from "./history-item";
import "./masonry.css";

const PAGE_SIZE = 10;

export function HistoryList() {
  const [items, setItems] = useState<Tables<"processing_history">[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [noMore, setNoMore] = useState(false);
  const loadingRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);

  // 响应式断点配置
  const breakpointColumns = {
    default: 4,
    1536: 4, // xl: 4列
    1280: 3, // lg: 3列
    1024: 2, // md: 2列
    640: 1, // sm: 1列
  };

  async function fetchHistoryPage(offset: number) {
    const supabase = createClient();

    const { data, error: fetchError } = await supabase
      .from("processing_history")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (fetchError) {
      throw fetchError;
    }

    return (data ?? []) as Tables<"processing_history">[];
  }

  // 加载下一页数据
  const loadMore = async () => {
    if (loadingMore || noMore || isFetchingRef.current)
      return;

    try {
      isFetchingRef.current = true;
      setLoadingMore(true);
      setLoadMoreError(null);

      const offset = items.length;
      const newItems = await fetchHistoryPage(offset);

      if (newItems.length < PAGE_SIZE) {
        setNoMore(true);
      }

      if (newItems.length > 0) {
        setItems(prev => [...prev, ...newItems]);
      }
    }
    catch (err) {
      console.error("加载更多历史记录失败:", err);
      setLoadMoreError("加载更多历史记录失败，请稍后重试");
    }
    finally {
      setLoadingMore(false);
      isFetchingRef.current = false;
    }
  };

  // 使用 Intersection Observer 监听底部触发器
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !loadingMore && !noMore) {
          void loadMore();
        }
      },
      { rootMargin: "400px" } // 提前 400px 触发
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [loading, loadingMore, noMore]);

  // 初始加载
  useEffect(() => {
    async function initialLoad() {
      try {
        setLoading(true);
        setLoadMoreError(null);

        const initialItems = await fetchHistoryPage(0);
        setItems(initialItems);
      }
      catch (err) {
        console.error("加载历史记录失败:", err);
        setLoadMoreError("加载历史记录失败，请稍后重试");
      }
      finally {
        setLoading(false);
      }
    }

    initialLoad();
  }, []);

  const skeleton = (count: number) => {
    return [...Array.from({ length: count })].map((_, i) => {
      const randomHeight = Math.floor(Math.random() * 201) + 200; // 200-400px
      return (
        <div
          key={`skeleton-${i}`}
          className="bg-muted animate-pulse rounded-lg"
          style={{ height: `${randomHeight}px` }}
        />
      );
    });
  };

  if (loading) {
    return (
      <Masonry
        breakpointCols={breakpointColumns}
        className="masonry-grid"
        columnClassName="masonry-grid-column"
      >
        {skeleton(8)}
      </Masonry>
    );
  }

  if (items.length === 0) {
    return <HistoryEmpty />;
  }

  return (
    <div>
      <Masonry
        breakpointCols={breakpointColumns}
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

        {loadingMore && skeleton(14)}
      </Masonry>

      {/* 无限滚动触发器和加载状态 */}
      <div ref={loadingRef} className="py-8">
        {/* 加载更多错误提示 */}
        {loadMoreError && (
          <div className="text-center mb-4">
            <p className="text-destructive text-sm mb-2">抱歉！我们这边遇到了一点问题</p>
            <Button
              onClick={() => {
                setLoadMoreError(null);
                void loadMore();
              }}
              variant="outline"
              size="sm"
            >
              点击重试
            </Button>
          </div>
        )}


        {/* 没有更多数据提示 */}
        {noMore && items.length > 0 && !loadMoreError && (
          <div className="text-center text-muted-foreground py-8">
            没有更多历史记录了
          </div>
        )}
      </div>
    </div>
  );
}
