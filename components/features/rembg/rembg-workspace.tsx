"use client";

/**
 * 背景移除工作区主组件
 */

import type { ImageItem, UploadError } from "./types";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { FullscreenDropProvider } from "@/components/providers/fullscreen-drop-provider";
import { useRemoveBackground } from "@/lib/hooks/use-remove-background";
import { toError } from "@/lib/utils";
import { FullscreenDropZone } from "./fullscreen-drop-zone";
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

  // 使用背景移除API
  const { mutateAsync: removeBackground } = useRemoveBackground();

  // 处理图片背景移除
  const processImage = async (id: string, file: File) => {
    try {
      // 更新状态为处理中
      updateImage({
        id,
        updates: {
          status: ImageStatus.Processing,
          progress: 50,
        }
      });

      // 调用背景移除API
      const resultBlob = await removeBackground({ imageFile: file });

      // 创建处理后的图片URL
      const processedUrl = URL.createObjectURL(resultBlob);

      // 更新为完成状态
      updateImage({
        id,
        updates: {
          status: ImageStatus.Completed,
          processedImageUrl: processedUrl,
          progress: 100,
        }
      });

      toast.success("背景移除成功");
    }
    catch (error) {
      // 更新为错误状态
      updateImage({
        id,
        updates: {
          status: ImageStatus.Error,
          error: toError(error)
        }
      });

      console.error(toError(error));


      toast.error("背景移除失败");
    }
  };

  // 处理文件选择
  const handleFilesSelected = async (files: File[]) => {
    const newImages: ImageItem[] = [];

    for (const file of files) {
      const imageItem: ImageItem = {
        id: uuidv4(),
        originImageFile: file,
        originImageUrl: URL.createObjectURL(file),
        status: ImageStatus.Uploading,
        progress: 0,
      };

      newImages.push(imageItem);
    }

    addImages(newImages);

    // 处理每张图片
    for (const image of newImages) {
      processImage(image.id, image.originImageFile);
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
      URL.revokeObjectURL(image.originImageUrl);
      if (image.processedImageUrl) {
        URL.revokeObjectURL(image.processedImageUrl);
      }
    }
    removeImage(id);
  };

  // 处理添加更多
  const handleAddMore = async (files: File[]) => {
    await handleFilesSelected(files);
  };

  return (
    <FullscreenDropProvider
      value={{
        onFilesSelected: handleFilesSelected,
        onError: handleUploadError,
      }}
    >
      <FullscreenDropZone
        onFilesSelected={handleFilesSelected}
        onError={handleUploadError}
      >
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
      </FullscreenDropZone>
    </FullscreenDropProvider>
  );
}
