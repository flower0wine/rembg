/**
 * Batch processing related type definitions
 */

export type BatchItemStatus = "pending" | "processing" | "completed" | "error";

export interface BatchItem {
  id: string;
  filename: string;
  status: BatchItemStatus;
  progress?: number;
  originalImage?: string;
  processedImage?: string;
  error?: string;
}

export interface BatchProcessingState {
  items: Map<string, BatchItem>;
  totalCount: number;
  completedCount: number;
  failedCount: number;
}
