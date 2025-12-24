"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { HistoryEmpty } from "./history-empty";
import { HistoryList } from "./history-list";

export interface ProcessingHistoryItem {
  id: string;
  user_id: string;
  original_image_url: string | null;
  processed_image_url: string | null;
  original_filename: string;
  processing_status: "processing" | "completed" | "failed";
  error_message: string | null;
  processing_time_ms: number | null;
  created_at: string;
  updated_at: string;
}

export function HistoryClient() {
  const [history, setHistory] = useState<ProcessingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      setLoading(true);
      setError(null);

      const supabase = createClient();

      const { data, error: fetchError } = await supabase
        .from("processing_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (fetchError) {
        throw fetchError;
      }

      setHistory(data || []);
    }
    catch (err) {
      console.error("加载历史记录失败:", err);
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
          onClick={loadHistory}
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

  return <HistoryList items={history} />;
}
