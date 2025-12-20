"use client";

/**
 * 背景移除工作区主组件
 */

import type { ImageItem, UploadError } from "./types";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { ProcessingPanel } from "./processing-panel";
import {
  addImagesAtom,
  imagesAtom,
  removeImageAtom,
  selectedImageAtom,
  selectedImageIdAtom,
  updateImageAtom,
} from "./store";
import { ThumbnailList } from "./thumbnail-list";
import { ImageStatus } from "./types";
import { UploadPanel } from "./upload-panel";

export function RembgWorkspace() {
  const images = useAtomValue(imagesAtom);
  const [selectedId, setSelectedId] = useAtom(selectedImageIdAtom);
  const selectedImage = useAtomValue(selectedImageAtom);
  const addImages = useSetAtom(addImagesAtom);
  const removeImage = useSetAtom(removeImageAtom);
  const updateImage = useSetAtom(updateImageAtom);

  // 模拟处理过程（实际应该调用API）
  const simulateProcessing = async (_id: string) => {
    // 模拟上传进度
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      // TODO: 更新进度
    }
    updateImage({
      id: _id,
      updates: {
        status: ImageStatus.Processing
      }
    });

    // TODO: 调用实际的背景移除API
    // 现在只是模拟完成
    await new Promise(resolve => setTimeout(resolve, 1000));

    updateImage({
      id: _id,
      updates: {
        status: ImageStatus.Error
      }
    });
  };

  // 处理文件选择
  const handleFilesSelected = async (files: File[]) => {
    const newImages: ImageItem[] = [];

    for (const file of files) {
      // 创建预览URL
      const preview = URL.createObjectURL(file);

      const imageItem: ImageItem = {
        id: uuidv4(),
        file,
        preview,
        status: ImageStatus.Uploading,
        progress: 0,
      };

      newImages.push(imageItem);
    }

    addImages(newImages);

    // TODO: 这里应该调用实际的上传和处理API
    // 现在只是模拟处理过程
    for (const image of newImages) {
      simulateProcessing(image.id);
    }
  };

  // 处理上传错误
  const handleUploadError = (error: UploadError) => {
    toast.error(error.message);
  };

  // 处理删除
  const handleRemove = (id: string) => {
    const image = images.find(img => img.id === id);
    if (image) {
      URL.revokeObjectURL(image.preview);
      if (image.processedImage) {
        URL.revokeObjectURL(image.processedImage);
      }
    }
    removeImage(id);
  };

  // 处理添加更多
  const handleAddMore = async (files: File[]) => {
    await handleFilesSelected(files);
  };

  return (
    <div className="space-y-6 w-full">
      {/* 主面板区域 */}
      <div className="w-full">
        {selectedImage
          ? (
              <ProcessingPanel image={selectedImage} />
            )
          : (
              <UploadPanel
                onFilesSelected={handleFilesSelected}
                onError={handleUploadError}
              />
            )}
      </div>

      {/* 缩略图列表 */}
      {images.length > 0 && (
        <ThumbnailList
          images={images}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onRemove={handleRemove}
          onAddMore={handleAddMore}
        />
      )}
    </div>
  );
}
