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
  originImageFile: File;
  originImageUrl: string; // 预览URL
  status: ImageStatus;
  progress: number; // 0-100
  processedImageUrl?: string; // 处理后的图片URL
  error?: Error;
}

export interface UploadError {
  type: "size" | "type" | "unknown";
  message: string;
}
