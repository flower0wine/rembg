"use client";

import type { TablesInsert } from "@/lib/supabase/database.types";
import type { ProcessingHistory } from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

interface HistoryFilters {
  limit?: number;
  offset?: number;
  orderBy?: "created_at";
  orderDirection?: "asc" | "desc";
}

interface HistoryQueryResult {
  data: ProcessingHistory[];
  count: number | null;
}

/**
 * Hook for fetching processing history for the current user
 */
export function useHistory(filters: HistoryFilters = {}) {
  const supabase = createClient();
  const {
    limit = 10,
    offset = 0,
    orderBy = "created_at",
    orderDirection = "desc",
  } = filters;

  return useQuery({
    queryKey: ["processing-history", { limit, offset, orderBy, orderDirection }],
    queryFn: async (): Promise<HistoryQueryResult> => {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      // Fetch history with count
      const query = supabase
        .from("processing_history")
        .select("*", { count: "exact" })
        .eq("user_id", user.id)
        .order(orderBy, { ascending: orderDirection === "asc" })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      return {
        data: data || [],
        count,
      };
    },
  });
}

/**
 * Hook for fetching a single history item by ID
 */
export function useHistoryItem(id: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["processing-history", id],
    queryFn: async (): Promise<ProcessingHistory | null> => {
      if (!id)
        return null;

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      // Fetch single history item
      const { data, error } = await supabase
        .from("processing_history")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    enabled: !!id,
  });
}

/**
 * Hook for creating a new history record
 */
export function useCreateHistory() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      historyData: Omit<TablesInsert<"processing_history">, "user_id">
    ): Promise<ProcessingHistory> => {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      // Prepare insert data with proper typing
      const insertData: TablesInsert<"processing_history"> = {
        original_image_url: historyData.original_image_url,
        processed_image_url: historyData.processed_image_url,
        original_filename: historyData.original_filename,
        file_size: historyData.file_size,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from("processing_history")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate history queries to refetch
      queryClient.invalidateQueries({ queryKey: ["processing-history"] });
    },
  });
}

/**
 * Hook for deleting a history record
 */
export function useDeleteHistory() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      // Delete history record (only if it belongs to the user)
      const { error } = await supabase
        .from("processing_history")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate history queries to refetch
      queryClient.invalidateQueries({ queryKey: ["processing-history"] });
    },
  });
}

/**
 * Hook for deleting all history records for the current user
 */
export function useDeleteAllHistory() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      // Delete all history records for the user
      const { error } = await supabase
        .from("processing_history")
        .delete()
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate history queries to refetch
      queryClient.invalidateQueries({ queryKey: ["processing-history"] });
    },
  });
}
