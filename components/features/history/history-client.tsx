"use client";

import type { Tables } from "@/lib/supabase/database.types";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { HistoryEmpty } from "./history-empty";
import { HistoryList } from "./history-list";

const PAGE_SIZE = 5;

export function HistoryClient() {
  const [history, setHistory] = useState<Tables<"processing_history">[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [noMore, setNoMore] = useState(false);
  const loadingRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);

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

      const offset = history.length;
      const newItems = await fetchHistoryPage(offset);

      if (newItems.length < PAGE_SIZE) {
        setNoMore(true);
      }

      if (newItems.length > 0) {
        setHistory(prev => [...prev, ...newItems]);
      }
    }
    catch (err) {
      console.error("加载更多历史记录失败:", err);
      setError("加载历史记录失败，请稍后重试");
    }
    finally {
      setLoadingMore(false);
      isFetchingRef.current = false;
    }
  };

  // 监听 window/html 滚动，接近底部时加载更多
  useEffect(() => {
    const handleScroll = () => {
      if (loading || loadingMore || noMore)
        return;

      const doc = document.documentElement;
      const scrollTop = doc.scrollTop;
      const clientHeight = doc.clientHeight;
      const scrollHeight = doc.scrollHeight;

      const distanceToBottom = scrollHeight - (scrollTop + clientHeight);

      if (distanceToBottom < 400) {
        void loadMore();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [loading, loadingMore, noMore, loadMore]);

  // 初始加载
  useEffect(() => {
    async function initialLoad() {
      try {
        setLoading(true);
        setError(null);

        const items = await fetchHistoryPage(0);
        setHistory(items);
      }
      catch (err) {
        console.error("加载历史记录失败:", err);
        setError("加载历史记录失败，请稍后重试");
      }
      finally {
        setLoading(false);
      }
    }

    initialLoad();
  }, []);

  async function retryLoad() {
    setHistory([]);
    setError(null);

    try {
      setLoading(true);
      const items = await fetchHistoryPage(0);
      setHistory(items);
    }
    catch (err) {
      console.error("重新加载历史记录失败:", err);
      setError("加载历史记录失败，请稍后重试");
    }
    finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array.from({ length: 3 })].map((_, i) => (
          <div
            key={i}
            className="h-32 bg-muted animate-pulse rounded-lg"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error}</p>
        <Button
          onClick={retryLoad}
          className="mt-4"
        >
          重试
        </Button>
      </div>
    );
  }

  if (history.length === 0) {
    return <HistoryEmpty />;
  }

  return (
    <div>
      <HistoryList items={history} />

      {/* 无限滚动触发器和加载状态 */}
      <div ref={loadingRef} className="py-8">
        {!noMore && (
          <div className="flex justify-center">
            <div className="space-y-4 w-full max-w-4xl">
              {[...Array.from({ length: 2 })].map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-muted animate-pulse rounded-lg"
                />
              ))}
            </div>
          </div>
        )}

        {noMore && history.length > 0 && (
          <div className="text-center text-muted-foreground">
            没有更多历史记录了
          </div>
        )}
      </div>
    </div>
  );
}