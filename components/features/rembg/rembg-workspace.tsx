"use client";

/**
 * 背景移除工作区主组件
 */

import type { ImageItem, UploadError } from "./types";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useTheme } from "next-themes";
import { Turnstile } from "next-turnstile";
import { useRef, useState } from "react";
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

  // Turnstile 状态管理
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const { theme, resolvedTheme } = useTheme();

  const [showTurnstile, setShowTurnstile] = useState(true); // 初始显示（Managed 会自动处理）

  const handleVerify = (newToken: string) => {
    setTurnstileToken(newToken);
    setShowTurnstile(false);
  };

  const handleError = () => {
    setTurnstileToken(null);
    toast.error("检测到可能存在自动化操作");
  };

  const handleExpire = () => {
    setTurnstileToken(null);
    setShowTurnstile(true);
  };

  // 使用背景移除API
  const { mutateAsync: removeBackground } = useRemoveBackground();

  // 处理图片背景移除
  const processImage = async (id: string, file: File) => {
    try {
      // 检查 Turnstile token
      if (!turnstileToken) {
        throw new Error("请完成机器人验证");
      }

      // 更新状态为处理中
      updateImage({
        id,
        updates: {
          status: ImageStatus.Processing,
          progress: 50,
        }
      });

      // 调用背景移除API，传递 Turnstile token
      const resultBlob = await removeBackground({
        imageFile: file,
        turnstileToken
      });

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

      // 重置 Turnstile token，要求重新验证
      setTurnstileToken(null);
    }
    catch (error) {
      const err = toError(error);

      // 更新为错误状态
      updateImage({
        id,
        updates: {
          status: ImageStatus.Error,
          error: err
        }
      });

      console.error("背景移除失败:", err);

      toast.error(err.message);

      // 重置 Turnstile token
      setTurnstileToken(null);
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

  // 获取 Turnstile 主题
  const getTurnstileTheme = (): "light" | "dark" | "auto" => {
    if (theme === "system") {
      return resolvedTheme === "dark" ? "dark" : "light";
    }
    return theme === "dark" ? "dark" : "light";
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

          {/* Turnstile 验证组件 */}
          {showTurnstile && (
            <div className="flex justify-center">
              <Turnstile
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                onVerify={handleVerify}
                onError={handleError}
                onExpire={handleExpire}
                sandbox={process.env.NODE_ENV === "development"}
                theme={getTurnstileTheme()}
                size="normal"
                appearance="interaction-only"
              />
            </div>
          )}

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
