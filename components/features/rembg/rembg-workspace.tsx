"use client";

/**
 * 背景移除工作区主组件
 */

import type { TurnstileInstance } from "@marsidev/react-turnstile";
import type { ImageItem, UploadError } from "./types";
import { Turnstile } from "@marsidev/react-turnstile";
import { isAxiosError } from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
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

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!;

interface Task { id: string; file: File }

export function RembgWorkspace() {
  const images = useAtomValue(imagesAtom);
  const [selectedId, setSelectedId] = useAtom(selectedImageIdAtom);
  const selectedImage = useAtomValue(selectedImageAtom);
  const addImages = useSetAtom(addImagesAtom);
  const removeImage = useSetAtom(removeImageAtom);
  const updateImage = useSetAtom(updateImageAtom);

  const turnstileRef = useRef<TurnstileInstance>(null);
  const [isFetchingTurnstileToken, setIsFetchingTurnstileToken] = useState(false);

  // Turnstile 状态管理
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const { theme, resolvedTheme } = useTheme();

  const [showTurnstile, setShowTurnstile] = useState(true); // 初始显示（Managed 会自动处理）

  // 待处理任务队列
  const [pendingTasks, setPendingTasks] = useState<Array<Task>>([]);

  // 使用背景移除API
  const { mutateAsync: removeBackground } = useRemoveBackground();

  // 实际处理图片背景移除（带 token）
  const processImageWithToken = async (task: Task, token: string) => {
    const { id, file } = task;
    try {
      // 更新状态为处理中
      updateImage({
        id,
        updates: {
          status: ImageStatus.Processing,
          progress: 50,
        }
      });

      // 调用背景移除API，传递 Turnstile token
      const result = await removeBackground({
        imageFile: file,
        turnstileToken: token
      });

      const processedUrl = result.url;

      // 更新为完成状态
      updateImage({
        id,
        updates: {
          status: ImageStatus.Completed,
          processedImageUrl: processedUrl,
          progress: 100,
        }
      });
    }
    catch (error) {
      // const err = toError(error);
      if (isAxiosError(error)) {
        const err = new Error(error.response?.data.error);
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
      }
    }
  };

  const processPendingTask = async (token: string) => {
    const handler = async () => {
      // Token 获取后，处理所有待处理的任务
      if (pendingTasks.length > 0 && token) {
        const task = pendingTasks[0];
        setPendingTasks(prev => prev.slice(1));
        turnstileRef.current?.reset();
        setIsFetchingTurnstileToken(true);

        await processImageWithToken(task, token);
      }
    };

    await handler();
  };

  const handleVerify = (newToken: string) => {
    setTurnstileToken(newToken);
    setShowTurnstile(false);
    setIsFetchingTurnstileToken(false);
  };


  const handleError = (error: unknown) => {
    setTurnstileToken(null);
    setIsFetchingTurnstileToken(false);

    toast.error("抱歉！处理过程遇到错误，请稍后重试");
    console.error(toError(error).message);
  };

  const handleExpire = () => {
    setTurnstileToken(null);
    setShowTurnstile(true);
    setIsFetchingTurnstileToken(false);
  };

  // 处理文件选择
  const handleFilesSelected = async (files: File[]) => {
    for (const file of files) {
      const id = uuidv4();
      const imageItem: ImageItem = {
        id,
        originImageFile: file,
        originImageUrl: URL.createObjectURL(file),
        status: ImageStatus.Verify,
        progress: 0,
      };

      addImages([imageItem]);

      setPendingTasks(prev => [...prev, { id, file }]);

      // 更新状态为等待验证
      updateImage({
        id,
        updates: {
          status: ImageStatus.Verify,
          progress: 10,
        }
      });
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

  console.log(turnstileRef.current, turnstileToken, pendingTasks, isFetchingTurnstileToken);


  useEffect(() => {
    if (!turnstileToken || pendingTasks.length === 0 || isFetchingTurnstileToken) {
      return;
    }
    processPendingTask(turnstileToken);
  }, [turnstileToken, pendingTasks, isFetchingTurnstileToken]);

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
        <div className="flex flex-col items-center gap-4 w-full">
          {/* 主面板区域 */}
          {selectedImage
            ? (
                <ProcessingPanel image={selectedImage} />
              )
            : (
                <div className="w-full">
                  <UploadPanel
                    onFilesSelected={handleFilesSelected}
                    onError={handleUploadError}
                  />
                </div>
              )}

          {/* Turnstile 验证组件 - 使用动画但保持 ref 存在 */}
          <div className="relative h-0 pointer-events-none z-999">
            {/* Turnstile 始终挂载以保持 ref，通过 CSS 控制可见性 */}
            <div
              className="absolute left-1/2 -translate-x-1/2 pointer-events-auto z-999 flex justify-center transition-all duration-300"
              style={{
                opacity: showTurnstile ? 1 : 0,
                transform: `translateX(-50%) scale(${showTurnstile ? 1 : 0.95}) translateY(${showTurnstile ? 0 : -10}px)`,
                pointerEvents: showTurnstile ? "auto" : "none",
              }}
            >
              <Turnstile
                ref={turnstileRef}
                siteKey={turnstileSiteKey}
                onSuccess={handleVerify}
                onError={handleError}
                onExpire={handleExpire}
                options={{
                  theme: getTurnstileTheme(),
                  size: "normal",
                  appearance: "interaction-only",
                }}
              />
            </div>
          </div>

          {/* 缩略图列表 */}
          {images.length > 0 && (
            <ThumbnailList
              className="flex-1 min-w-20 w-full"
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
