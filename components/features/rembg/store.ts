/**
 * 背景移除功能的状态管理 (Jotai)
 */

import type { ImageItem } from "./types";
import { atom } from "jotai";

// 图片列表
export const imagesAtom = atom<ImageItem[]>([]);

// 当前选中的图片ID
export const selectedImageIdAtom = atom<string | null>(null);

// 当前选中的图片（派生状态）
export const selectedImageAtom = atom((get) => {
  const images = get(imagesAtom);
  const selectedId = get(selectedImageIdAtom);
  return images.find(img => img.id === selectedId) || null;
});

// 添加图片
export const addImagesAtom = atom(
  null,
  (get, set, newImages: ImageItem[]) => {
    const current = get(imagesAtom);
    const updated = [...current, ...newImages];
    set(imagesAtom, updated);

    // 如果没有选中的图片，自动选中第一张新添加的
    if (!get(selectedImageIdAtom) && newImages.length > 0) {
      set(selectedImageIdAtom, newImages[0].id);
    }
  }
);

// 更新图片状态
export const updateImageAtom = atom(
  null,
  (get, set, { id, updates }: { id: string; updates: Partial<ImageItem> }) => {
    const images = get(imagesAtom);
    const updated = images.map(img =>
      img.id === id ? { ...img, ...updates } : img
    );
    set(imagesAtom, updated);
  }
);

// 删除图片
export const removeImageAtom = atom(
  null,
  (get, set, id: string) => {
    const images = get(imagesAtom);
    const updated = images.filter(img => img.id !== id);
    set(imagesAtom, updated);

    // 如果删除的是当前选中的图片，选中下一张
    if (get(selectedImageIdAtom) === id) {
      const nextImage = updated[0];
      set(selectedImageIdAtom, nextImage?.id || null);
    }
  }
);
