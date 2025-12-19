/**
 * Mock background removal API for development/testing
 * Returns a mock processed image after a delay
 */

import type { BatchItemResponse, BatchRemoveBackgroundResponse } from "./background-removal";
import type { RemoveBackgroundResponse } from "@/lib/types";

// 设置你的测试图片 URL（处理后的图片）
const MOCK_PROCESSED_IMAGE_URL = "https://static.vecteezy.com/system/resources/thumbnails/057/068/323/small/single-fresh-red-strawberry-on-table-green-background-food-fruit-sweet-macro-juicy-plant-image-photo.jpg";

// 模拟处理延迟（毫秒）
const MOCK_PROCESSING_DELAY = 2000;

/**
 * 模拟单张图片背景移除
 */
export async function mockRemoveBackground(
  image: File | string,
): Promise<RemoveBackgroundResponse> {
  // 模拟处理延迟
  await new Promise(resolve => setTimeout(resolve, MOCK_PROCESSING_DELAY));

  // 获取原始图片的 URL
  let originalImageUrl: string;
  if (image instanceof File) {
    originalImageUrl = URL.createObjectURL(image);
  }
  else {
    originalImageUrl = image;
  }

  // 返回模拟的成功响应
  return {
    success: true,
    data: {
      processedImage: MOCK_PROCESSED_IMAGE_URL,
      originalSize: { width: 800, height: 600 },
      processedSize: { width: 800, height: 600 },
    },
  };
}

/**
 * 模拟批量图片背景移除
 */
export async function mockBatchRemoveBackground(
  images: File[],
): Promise<BatchRemoveBackgroundResponse> {
  const results: BatchItemResponse[] = [];

  for (const image of images) {
    // 模拟每张图片的处理延迟
    await new Promise(resolve => setTimeout(resolve, MOCK_PROCESSING_DELAY));

    results.push({
      id: Math.random().toString(36).slice(2),
      filename: image.name,
      success: true,
      data: {
        processedImage: MOCK_PROCESSED_IMAGE_URL,
        originalSize: { width: 800, height: 600 },
        processedSize: { width: 800, height: 600 },
      },
    });
  }

  return {
    success: true,
    results,
    totalCount: images.length,
    successCount: images.length,
    failedCount: 0,
  };
}

/**
 * 模拟单个批量项处理
 */
export async function mockProcessSingleBatchItem(
  file: File,
): Promise<RemoveBackgroundResponse> {
  return mockRemoveBackground(file);
}
