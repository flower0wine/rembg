/**
 * Hook for handling image selection and navigation
 */

"use client";

import { useAtom } from "jotai";
import { useCallback } from "react";
import { imagesAtom, selectedImageIdAtom } from "../store";

export function useImageSelection() {
  const [images] = useAtom(imagesAtom);
  const [selectedImageId, setSelectedImageId] = useAtom(selectedImageIdAtom);

  const selectImage = useCallback(
    (id: string) => {
      if (images.find(img => img.id === id)) {
        setSelectedImageId(id);
      }
    },
    [images, setSelectedImageId]
  );

  const selectPrevious = useCallback(() => {
    if (images.length === 0)
      return;
    const currentIndex = images.findIndex(img => img.id === selectedImageId);
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    setSelectedImageId(images[newIndex].id);
  }, [images, selectedImageId, setSelectedImageId]);

  const selectNext = useCallback(() => {
    if (images.length === 0)
      return;
    const currentIndex = images.findIndex(img => img.id === selectedImageId);
    const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    setSelectedImageId(images[newIndex].id);
  }, [images, selectedImageId, setSelectedImageId]);

  return {
    selectImage,
    selectPrevious,
    selectNext,
  };
}
