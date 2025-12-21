"use client";

import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { removeBackground, removeBackgroundFromUrl } from "../request/api/rembg";

interface RemoveBackgroundParams {
  imageFile: File;
  turnstileToken?: string;
}

interface RemoveBackgroundFromUrlParams {
  imageUrl: string;
  turnstileToken?: string;
}

/**
 * 移除图片背景的 Hook
 */
export function useRemoveBackground() {
  return useMutation({
    mutationFn: async ({ imageFile, turnstileToken }: RemoveBackgroundParams) => {
      return removeBackground(imageFile, turnstileToken);
    },
  });
}

/**
 * 通过 URL 移除图片背景的 Hook
 */
export function useRemoveBackgroundFromUrl() {
  return useMutation({
    mutationFn: async ({ imageUrl, turnstileToken }: RemoveBackgroundFromUrlParams) => {
      return removeBackgroundFromUrl(imageUrl, turnstileToken);
    },
  });
}
