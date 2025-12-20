/**
 * React Query hook for batch image background removal
 * Requirements: 9.2
 */

"use client";

import type { UseMutationResult } from "@tanstack/react-query";
import type {
  BatchItemResponse,
  BatchRemoveBackgroundRequest,
  BatchRemoveBackgroundResponse,
} from "@/lib/api/background-removal";
import type { BatchItem, BatchItemStatus } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useState } from "react";

import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { v4 as uuidv4 } from "uuid";

import {
  batchRemoveBackground,
  processSingleBatchItem,
} from "@/lib/api/background-removal";
import { getSessionFingerprint } from "@/lib/utils/fingerprint.util";

/**
 * Input for batch removal mutation
 */
export interface BatchRemovalInput {
  images: File[];
  imageIds: string[]; // Store 中的图片 IDs
}

/**
 * Extended batch item with original file reference
 */
interface BatchItemWithFile extends BatchItem {
  file?: File;
}

/**
 * Batch removal state management
 */
export interface UseBatchRemovalResult {
  mutation: UseMutationResult<BatchRemoveBackgroundResponse, Error, BatchRemovalInput>;
  items: BatchItem[];
  updateItemStatus: (id: string, status: BatchItemStatus, data?: Partial<BatchItem>) => void;
  retryItem: (id: string) => Promise<void>;
  clearItems: () => void;
  isProcessing: boolean;
}

/**
 * Hook for batch image background removal
 * Manages batch processing state and provides retry functionality
 *
 * @returns UseBatchRemovalResult with mutation and state management
 */
export function useBatchRemoval(): UseBatchRemovalResult {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [items, setItems] = useState<BatchItemWithFile[]>([]);

  // Update item status
  const updateItemStatus = useCallback(
    (id: string, status: BatchItemStatus, data?: Partial<BatchItem>) => {
      setItems(prev =>
        prev.map(item =>
          item.id === id
            ? { ...item, status, ...data }
            : item,
        ),
      );
    },
    [],
  );

  // Retry a single failed item
  const retryItem = useCallback(
    async (id: string) => {
      const item = items.find(i => i.id === id);
      if (!item || !item.file || !executeRecaptcha) {
        updateItemStatus(id, "error", {
          error: "无法重试：原始文件不可用",
        });
        return;
      }

      updateItemStatus(id, "processing");

      try {
        const captchaToken = await executeRecaptcha("remove_background");
        const fingerprint = await getSessionFingerprint();
        const response = await processSingleBatchItem(item.file, captchaToken, fingerprint);

        if (response.success && response.data) {
          updateItemStatus(id, "completed", {
            processedImage: response.data.processedImage,
            error: undefined,
          });
        }
        else {
          updateItemStatus(id, "error", {
            error: response.error?.message || "重试失败",
          });
        }
      }
      catch (error) {
        updateItemStatus(id, "error", {
          error: error instanceof Error ? error.message : "重试失败",
        });
      }
    },
    [items, executeRecaptcha, updateItemStatus],
  );

  // Clear all items
  const clearItems = useCallback(() => {
    setItems([]);
  }, []);

  // Main batch mutation
  const mutation = useMutation({
    mutationFn: async (input: BatchRemovalInput) => {
      if (!executeRecaptcha) {
        throw new Error("reCAPTCHA not available");
      }

      // Initialize items with pending status and store original files
      const initialItems: BatchItemWithFile[] = input.images.map(file => ({
        id: uuidv4(),
        filename: file.name,
        status: "pending",
        file, // Store original file for retry
      }));

      setItems(initialItems);

      // Generate reCAPTCHA token
      const captchaToken = await executeRecaptcha("remove_background_batch");

      // Update all items to processing
      setItems(prev => prev.map(item => ({ ...item, status: "processing" })));

      // Call batch API
      const request: BatchRemoveBackgroundRequest = {
        images: input.images,
        captchaToken,
      };

      const response = await batchRemoveBackground(request);

      // Update items with results
      setItems(prev =>
        prev.map((item) => {
          const result = response.results.find(r => r.filename === item.filename);
          if (!result) {
            return { ...item, status: "error", error: "未找到处理结果" };
          }

          if (result.success && result.data) {
            return {
              ...item,
              status: "completed",
              processedImage: result.data.processedImage,
            };
          }

          return {
            ...item,
            status: "error",
            error: result.error?.message || "处理失败",
          };
        }),
      );

      return response;
    },
    retry: false,
  });

  return {
    mutation,
    items: items.map(({ file, ...item }) => item), // Remove file from exposed items
    updateItemStatus,
    retryItem,
    clearItems,
    isProcessing: mutation.isPending,
  };
}

/**
 * Hook for sequential batch processing
 * Processes images one by one instead of all at once
 * Useful for better progress tracking and error isolation
 *
 * @param updateImageStatus - 回调函数，用于更新 store 中的图片状态
 * @returns UseBatchRemovalResult with sequential processing
 */
export function useSequentialBatchRemoval(
  updateImageStatus?: (id: string, status: BatchItemStatus, data?: { processedImage?: string; error?: string }) => void
): UseBatchRemovalResult {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [items, setItems] = useState<BatchItemWithFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const updateItemStatus = useCallback(
    (id: string, status: BatchItemStatus, data?: Partial<BatchItem>) => {
      setItems(prev =>
        prev.map(item =>
          item.id === id
            ? { ...item, status, ...data }
            : item,
        ),
      );
    },
    [],
  );

  const retryItem = useCallback(
    async (id: string) => {
      const item = items.find(i => i.id === id);
      if (!item || !item.file || !executeRecaptcha) {
        updateItemStatus(id, "error", {
          error: "无法重试：原始文件不可用",
        });
        return;
      }

      updateItemStatus(id, "processing");

      try {
        const captchaToken = await executeRecaptcha("remove_background");
        const fingerprint = await getSessionFingerprint();
        const response = await processSingleBatchItem(item.file, captchaToken, fingerprint);

        if (response.success && response.data) {
          updateItemStatus(id, "completed", {
            processedImage: response.data.processedImage,
            progress: 100,
            error: undefined,
          });
        }
        else {
          updateItemStatus(id, "error", {
            error: response.error?.message || "重试失败",
          });
        }
      }
      catch (error) {
        updateItemStatus(id, "error", {
          error: error instanceof Error ? error.message : "重试失败",
        });
      }
    },
    [items, executeRecaptcha, updateItemStatus],
  );

  const clearItems = useCallback(() => {
    setItems([]);
  }, []);

  const mutation = useMutation({
    mutationFn: async (input: BatchRemovalInput) => {
      if (!executeRecaptcha) {
        throw new Error("reCAPTCHA not available");
      }

      setIsProcessing(true);

      // Initialize items with original files and use provided imageIds
      const initialItems: BatchItemWithFile[] = input.images.map((file, index) => ({
        id: input.imageIds[index] || uuidv4(), // 使用 store 中的 ID
        filename: file.name,
        status: "pending",
        file, // Store original file for retry
      }));

      setItems(initialItems);
      
      // 同步初始状态到 store
      if (updateImageStatus) {
        initialItems.forEach((item) => {
          updateImageStatus(item.id, "pending");
        });
      }

      const results: BatchItemResponse[] = [];
      let successCount = 0;
      let failedCount = 0;

      // Process each image sequentially
      for (let i = 0; i < input.images.length; i++) {
        const file = input.images[i];
        const itemId = initialItems[i].id;

        updateItemStatus(itemId, "processing", { progress: 0 });
        
        // 同步到 store
        if (updateImageStatus) {
          updateImageStatus(itemId, "processing");
        }

        try {
          const captchaToken = await executeRecaptcha("remove_background");
          const fingerprint = await getSessionFingerprint();
          const response = await processSingleBatchItem(file, captchaToken, fingerprint);

          if (response.success && response.data) {
            updateItemStatus(itemId, "completed", {
              processedImage: response.data.processedImage,
              progress: 100,
            });
            
            // 同步到 store
            if (updateImageStatus) {
              updateImageStatus(itemId, "completed", {
                processedImage: response.data.processedImage,
              });
            }
            
            successCount++;
            results.push({
              id: itemId,
              filename: file.name,
              success: true,
              data: response.data,
            });
          }
          else {
            const errorMsg = response.error?.message || "处理失败";
            updateItemStatus(itemId, "error", {
              error: errorMsg,
            });
            
            // 同步到 store
            if (updateImageStatus) {
              updateImageStatus(itemId, "error", {
                error: errorMsg,
              });
            }
            
            failedCount++;
            results.push({
              id: itemId,
              filename: file.name,
              success: false,
              error: response.error,
            });
          }
        }
        catch (error) {
          const errorMessage = error instanceof Error ? error.message : "处理失败";
          updateItemStatus(itemId, "error", {
            error: errorMessage,
          });
          
          // 同步到 store
          if (updateImageStatus) {
            updateImageStatus(itemId, "error", {
              error: errorMessage,
            });
          }
          
          failedCount++;
          results.push({
            id: itemId,
            filename: file.name,
            success: false,
            error: {
              code: "PROCESSING_ERROR",
              message: errorMessage,
            },
          });
        }
      }

      setIsProcessing(false);

      return {
        success: failedCount === 0,
        results,
        totalCount: input.images.length,
        successCount,
        failedCount,
      };
    },
    retry: false,
  });

  return {
    mutation,
    items: items.map(({ file, ...item }) => item), // Remove file from exposed items
    updateItemStatus,
    retryItem,
    clearItems,
    isProcessing,
  };
}
