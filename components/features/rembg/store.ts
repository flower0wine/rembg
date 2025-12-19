/**
 * Jotai state management for rembg image processing
 */

import { atom } from "jotai";
import { v4 as uuidv4 } from "uuid";

export interface RemBgImage {
  id: string;
  originalFile: File | null; // 保存原始 File 对象，用于上传和重试
  originalImage: string; // 预览 URL (blob URL 或远程 URL)
  filename: string;
  processedImage?: string;
  status: "processing" | "completed" | "error" | "pending";
  error?: string;
}

// Images list atom
export const imagesAtom = atom<RemBgImage[]>([]);

// Selected image ID atom
export const selectedImageIdAtom = atom<string | null>(null);

// Processing state atom
export const isProcessingAtom = atom(false);

// Derived atom: current selected image
export const currentImageAtom = atom((get) => {
  const images = get(imagesAtom);
  const selectedId = get(selectedImageIdAtom);
  return images.find(img => img.id === selectedId) || images[0] || null;
});

// Derived atom: has images
export const hasImagesAtom = atom((get) => {
  return get(imagesAtom).length > 0;
});

// Derived atom: completed images count
export const completedImagesCountAtom = atom((get) => {
  return get(imagesAtom).filter(img => img.status === "completed").length;
});

// Write-only atom: 添加图片
export const addImageAtom = atom(
  null,
  (get, set, imageSource: File | string, filename: string) => {
    const id = uuidv4();
    let originalImage: string;
    let originalFile: File | null = null;

    if (imageSource instanceof File) {
      originalImage = URL.createObjectURL(imageSource);
      originalFile = imageSource;
    }
    else {
      originalImage = imageSource;
      originalFile = null;
    }

    const newImage: RemBgImage = {
      id,
      originalFile,
      originalImage,
      filename,
      status: "pending",
    };

    set(imagesAtom, [...get(imagesAtom), newImage]);
    return id; // 返回生成的 ID
  }
);

// Write-only atom: 更新图片状态
export const updateImageStatusAtom = atom(
  null,
  (get, set, id: string, status: RemBgImage["status"], data?: { processedImage?: string; error?: string }) => {
    set(imagesAtom, get(imagesAtom).map(img =>
      img.id === id
        ? {
            ...img,
            status,
            processedImage: data?.processedImage || img.processedImage,
            error: data?.error,
          }
        : img
    ));
  }
);

// Write-only atom: 删除图片
export const removeImageAtom = atom(
  null,
  (get, set, id: string) => {
    const images = get(imagesAtom);
    const imageToRemove = images.find(img => img.id === id);

    // 清理 blob URL
    if (imageToRemove?.originalFile && imageToRemove.originalImage.startsWith("blob:")) {
      URL.revokeObjectURL(imageToRemove.originalImage);
    }
    if (imageToRemove?.processedImage?.startsWith("blob:")) {
      URL.revokeObjectURL(imageToRemove.processedImage);
    }

    set(imagesAtom, images.filter(img => img.id !== id));
  }
);

// Write-only atom: 清空所有图片
export const clearAllImagesAtom = atom(
  null,
  (get, set) => {
    const images = get(imagesAtom);

    // 清理所有 blob URLs
    images.forEach((img) => {
      if (img.originalFile && img.originalImage.startsWith("blob:")) {
        URL.revokeObjectURL(img.originalImage);
      }
      if (img.processedImage?.startsWith("blob:")) {
        URL.revokeObjectURL(img.processedImage);
      }
    });

    set(imagesAtom, []);
    set(selectedImageIdAtom, null);
  }
);
