/**
 * 背景移除功能的类型定义
 */

export enum ImageStatus {
  Uploading = "uploading",
  Processing = "processing",
  Completed = "completed",
  Error = "error",
}

export interface ImageItem {
  id: string;
  file: File;
  preview: string; // 预览URL
  status: ImageStatus;
  progress: number; // 0-100
  processedImage?: string; // 处理后的图片URL
  error?: string;
}

export interface UploadError {
  type: "size" | "type" | "unknown";
  message: string;
}
