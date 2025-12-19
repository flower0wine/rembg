/**
 * Background removal API functions
 * Requirements: 4.1, 9.2
 */

import type { RemoveBackgroundRequest, RemoveBackgroundResponse } from "@/lib/types";

import { apiClient } from "./client";
import {
  mockBatchRemoveBackground,
  mockProcessSingleBatchItem,
  mockRemoveBackground,
} from "./mock-background-removal";

// 开发模式开关 - 设置为 true 使用模拟数据
const USE_MOCK_API = true;

/**
 * Single image background removal
 * Sends an image (File or URL) to the API for background removal
 *
 * @param request - RemoveBackgroundRequest containing image and captcha token
 * @param fingerprint - Browser fingerprint for usage tracking
 * @returns Promise<RemoveBackgroundResponse> with processed image data
 */
export async function removeBackground(
  request: RemoveBackgroundRequest,
  fingerprint: string,
): Promise<RemoveBackgroundResponse> {
  // 使用模拟 API
  if (USE_MOCK_API) {
    return mockRemoveBackground(request.image);
  }

  const formData = new FormData();

  // Handle File or URL
  if (request.image instanceof File) {
    formData.append("image", request.image);
  }
  else {
    formData.append("imageUrl", request.image);
  }

  formData.append("captchaToken", request.captchaToken);
  formData.append("fingerprint", fingerprint);

  const response = await apiClient.post<RemoveBackgroundResponse>(
    "/remove-bg",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
}

/**
 * Batch image background removal request
 */
export interface BatchRemoveBackgroundRequest {
  images: File[];
  captchaToken: string;
}

/**
 * Batch image background removal response for a single item
 */
export interface BatchItemResponse {
  id: string;
  filename: string;
  success: boolean;
  data?: {
    processedImage: string;
    originalSize: { width: number; height: number };
    processedSize: { width: number; height: number };
  };
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Batch background removal response
 */
export interface BatchRemoveBackgroundResponse {
  success: boolean;
  results: BatchItemResponse[];
  totalCount: number;
  successCount: number;
  failedCount: number;
}

/**
 * Batch image background removal
 * Processes multiple images in a single request
 *
 * @param request - BatchRemoveBackgroundRequest containing multiple images and captcha token
 * @returns Promise<BatchRemoveBackgroundResponse> with results for each image
 */
export async function batchRemoveBackground(
  request: BatchRemoveBackgroundRequest,
): Promise<BatchRemoveBackgroundResponse> {
  // 使用模拟 API
  if (USE_MOCK_API) {
    return mockBatchRemoveBackground(request.images);
  }

  const formData = new FormData();

  // Append all images
  request.images.forEach((image) => {
    formData.append("images", image);
  });

  formData.append("captchaToken", request.captchaToken);

  const response = await apiClient.post<BatchRemoveBackgroundResponse>(
    "/remove-bg/batch",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 120000, // 2 minutes for batch processing
    },
  );

  return response.data;
}

/**
 * Process a single image from a batch
 * Used for retry logic when individual items fail
 *
 * @param file - The image file to process
 * @param captchaToken - reCAPTCHA token
 * @param fingerprint - Browser fingerprint for usage tracking
 * @returns Promise<RemoveBackgroundResponse>
 */
export async function processSingleBatchItem(
  file: File,
  captchaToken: string,
  fingerprint: string,
): Promise<RemoveBackgroundResponse> {
  // 使用模拟 API
  if (USE_MOCK_API) {
    return mockProcessSingleBatchItem(file);
  }

  return removeBackground({
    image: file,
    captchaToken,
  }, fingerprint);
}

/**
 * Check usage limit for guest users
 * Verifies if the current user/device can process images
 *
 * @param fingerprint - Browser fingerprint for guest users
 * @returns Promise with usage limit information
 */
export interface UsageLimitCheckResponse {
  canProcess: boolean;
  remainingCount: number;
  requiresLogin: boolean;
  message?: string;
}

export async function checkUsageLimit(
  fingerprint?: string,
): Promise<UsageLimitCheckResponse> {
  const response = await apiClient.post<UsageLimitCheckResponse>(
    "/check-usage",
    { fingerprint },
  );

  return response.data;
}
