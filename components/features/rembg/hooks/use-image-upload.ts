/**
 * Hook for handling image upload logic
 */

"use client";

import { useSetAtom } from "jotai";
import { useCallback } from "react";
import { 
  addImageAtom, 
  updateImageStatusAtom, 
  removeImageAtom, 
  clearAllImagesAtom,
  type RemBgImage 
} from "../store";

export function useImageUpload() {
  const addImage = useSetAtom(addImageAtom);
  const updateImageStatus = useSetAtom(updateImageStatusAtom);
  const removeImage = useSetAtom(removeImageAtom);
  const clearAllImages = useSetAtom(clearAllImagesAtom);

  return {
    addImage: useCallback((imageSource: File | string, filename: string) => {
      return addImage(imageSource, filename);
    }, [addImage]),
    updateImageStatus: useCallback((id: string, status: RemBgImage["status"], data?: { processedImage?: string; error?: string }) => {
      updateImageStatus(id, status, data);
    }, [updateImageStatus]),
    removeImage: useCallback((id: string) => {
      removeImage(id);
    }, [removeImage]),
    clearAllImages: useCallback(() => {
      clearAllImages();
    }, [clearAllImages]),
  };
}
