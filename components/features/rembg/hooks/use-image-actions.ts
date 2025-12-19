/**
 * Hook for handling image processing actions (process, retry, download)
 */

"use client";

import { useAtom, useSetAtom } from "jotai";
import { useCallback } from "react";
import { toast } from "sonner";
import { useSequentialBatchRemoval } from "@/lib/hooks/use-batch-removal";
import { downloadProcessedImage } from "@/lib/utils/download";
import { imagesAtom, isProcessingAtom, selectedImageIdAtom, updateImageStatusAtom } from "../store";
import { useImageUpload } from "./use-image-upload";

export function useImageActions() {
  const [images] = useAtom(imagesAtom);
  const setSelectedImageId = useSetAtom(selectedImageIdAtom);
  const setIsProcessing = useSetAtom(isProcessingAtom);
  const updateImageStatus = useSetAtom(updateImageStatusAtom);
  const { addImage } = useImageUpload();

  // Batch processing - 直接传入 store 的 updateImageStatus
  const batchRemoval = useSequentialBatchRemoval(updateImageStatus);

  // Process images (single or multiple)
  const processBatch = useCallback(
    (files: File[]) => {
      if (files.length === 0) {
        toast.error("请选择至少一个文件");
        return;
      }

      toast.success(`已开始处理`);

      // Add all images to store and collect IDs
      const imageIds = files.map((file) => addImage(file, file.name));
      
      // Select first image
      if (imageIds.length > 0) {
        setSelectedImageId(imageIds[0]);
      }

      setIsProcessing(true);
      
      // 启动批处理，传入 image IDs
      batchRemoval.mutation.mutate({ images: files, imageIds });
    },
    [addImage, setSelectedImageId, setIsProcessing, batchRemoval]
  );

  // Process single image (file or URL)
  const processImage = useCallback(
    async (imageSource: File | string, filename: string) => {
      const imageId = addImage(imageSource, filename);
      setSelectedImageId(imageId);
      setIsProcessing(true);

      // Convert to File array for batch processing
      const files = imageSource instanceof File ? [imageSource] : [];
      if (files.length > 0) {
        batchRemoval.mutation.mutate({ images: files, imageIds: [imageId] });
      }
    },
    [addImage, setSelectedImageId, setIsProcessing, batchRemoval]
  );

  // Retry failed image
  const retryImage = useCallback(
    (id: string) => {
      const image = images.find(img => img.id === id);
      if (image && image.originalFile) {
        setSelectedImageId(id);
        updateImageStatus(id, "processing", { error: undefined });
        setIsProcessing(true);
        batchRemoval.mutation.mutate({ images: [image.originalFile], imageIds: [id] });
      }
    },
    [images, setSelectedImageId, updateImageStatus, setIsProcessing, batchRemoval]
  );

  // Download single image
  const downloadImage = useCallback(
    (id: string) => {
      const image = images.find(img => img.id === id);
      if (image?.processedImage && image.filename) {
        try {
          downloadProcessedImage(image.processedImage, image.filename);
          toast.success(`下载 ${image.filename} 成功`);
        }
        catch (error) {
          toast.error("下载失败，请重试", {
            duration: 3000,
            action: {
              label: "重试",
              onClick: () => downloadImage(id),
            },
          });
        }
      }
      else {
        toast.error("图片未处理完成");
      }
    },
    [images]
  );

  // Download all completed images
  const downloadAll = useCallback(() => {
    const completedImages = images.filter(
      img => img.status === "completed" && img.processedImage
    );

    if (completedImages.length === 0) {
      toast.error("没有可下载的图片");
      return;
    }

    let successCount = 0;
    let failCount = 0;

    completedImages.forEach((img) => {
      try {
        if (img.processedImage && img.filename) {
          downloadProcessedImage(img.processedImage, img.filename);
          successCount++;
        }
      }
      catch (error) {
        failCount++;
      }
    });

    if (successCount > 0) {
      toast.success(
        `成功下载 ${successCount} 个文件${failCount > 0 ? `，${failCount} 个失败` : ""}`
      );
    }
    else {
      toast.error("下载失败，请重试");
    }
  }, [images]);

  return {
    processImage,
    processBatch,
    retryImage,
    downloadImage,
    downloadAll,
    isProcessing: batchRemoval.isProcessing,
    batchRemoval,
  };
}
