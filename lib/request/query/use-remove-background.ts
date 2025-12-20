import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { removeBackground, removeBackgroundFromUrl } from "../api/rembg";

interface RemoveBackgroundParams {
  imageFile: File;
}

interface RemoveBackgroundFromUrlParams {
  imageUrl: string;
}

/**
 * 移除图片背景的 Hook
 */
export function useRemoveBackground(
  options?: UseMutationOptions<Blob, Error, RemoveBackgroundParams>
) {
  return useMutation({
    mutationFn: async ({ imageFile }: RemoveBackgroundParams) => {
      return removeBackground(imageFile);
    },
    ...options,
  });
}

/**
 * 通过 URL 移除图片背景的 Hook
 */
export function useRemoveBackgroundFromUrl(
  options?: UseMutationOptions<Blob, Error, RemoveBackgroundFromUrlParams>
) {
  return useMutation({
    mutationFn: async ({ imageUrl }: RemoveBackgroundFromUrlParams) => {
      return removeBackgroundFromUrl(imageUrl);
    },
    ...options,
  });
}
