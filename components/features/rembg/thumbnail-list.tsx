"use client";

/**
 * 缩略图列表组件 - 水平滚动的图片缩略图
 */

import type { ImageItem } from "./types";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Link2, MoreVertical, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { download } from "@/lib/utils/download.util";
import { getFileName } from "@/lib/utils/file";
import { ImageFileInput, useImageFileInput } from "./image-file-input";

interface ThumbnailListProps {
  images: ImageItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onAddMore: (files: File[]) => void;
  className?: string;
}

export function ThumbnailList({
  images,
  selectedId,
  onSelect,
  onRemove,
  onAddMore,
  className,
}: ThumbnailListProps) {
  const { inputRef, openFileDialog, onFilesSelected } = useImageFileInput(
    (files) => {
      if (files && files.length > 0) {
        const fileArray = Array.from(files);
        onAddMore(fileArray);
      }
    }
  );

  if (images.length === 0)
    return null;

  const handleDownload = (image: ImageItem) => {
    if (image.processedImageUrl) {
      download(image.processedImageUrl, `${getFileName(image.originImageFile.name)}.png`);
    }
  };

  return (
    <motion.div
      className={cn("flex gap-3", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* 缩略图滚动容器 */}
      <div className="overflow-x-auto py-2">
        <div className="flex gap-3">
          <AnimatePresence mode="popLayout">
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                className="relative group shrink-0"
                initial={{ opacity: 0, scale: 0.8, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 20 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.05,
                }}
                layout
              >
                {/* 缩略图 */}
                <motion.button
                  onClick={() => onSelect(image.id)}
                  className={cn(
                    "relative size-20 rounded-lg overflow-hidden border-2 transition-all",
                    selectedId === image.id
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-transparent hover:border-primary/50"
                  )}
                >
                  {/* 背景光晕 */}
                  {selectedId === image.id && (
                    <motion.div
                      className="absolute -inset-1 bg-primary/20 rounded-lg blur-md -z-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}

                  <Image
                    src={image.processedImageUrl || image.originImageUrl}
                    alt={image.originImageFile.name}
                    fill
                    sizes="80px"
                    className="object-cover hover:scale-105 duration-300 transition-all"
                  />

                  {/* 状态指示器 */}
                  {image.status === "processing" && (
                    <motion.div
                      className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[1px]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        className="size-5 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                    </motion.div>
                  )}

                  {image.status === "error" && (
                    <motion.div
                      className="absolute inset-0 bg-destructive/10 flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.span
                        className="text-white text-lg font-bold"
                        animate={{
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                        }}
                      >
                        !
                      </motion.span>
                    </motion.div>
                  )}

                  {/* 完成状态的勾选标记 */}
                  {image.status === "completed" && (
                    <motion.div
                      className="absolute bottom-1 right-1 size-5 rounded-full bg-primary flex items-center justify-center"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                    >
                      <svg
                        className="size-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </motion.div>
                  )}
                </motion.button>

                {/* 更多按钮 */}
                {image.processedImageUrl && (
                  <motion.div
                    className={cn(
                      "absolute top-1 right-1",
                      "opacity-0 group-hover:opacity-100 transition-opacity"
                    )}
                    initial={{ scale: 0.8 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          onClick={e => e.stopPropagation()}
                          className={cn(
                            "size-6 rounded-full bg-background border border-border text-foreground",
                            "flex items-center justify-center shadow-md",
                            "hover:bg-accent transition-colors"
                          )}
                        >
                          <MoreVertical className="size-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="top" align="center" className="w-40">
                        <DropdownMenuItem
                          onClick={() => {
                            handleDownload(image);
                          }}
                        >
                          <Download className="size-4 mr-2" />
                          下载
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            const link = image.processedImageUrl || image.originImageUrl;
                            navigator.clipboard.writeText(link);
                          }}
                        >
                          <Link2 className="size-4 mr-2" />
                          复制链接
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemove(image.id);
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="size-4 mr-2" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* 添加按钮 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: images.length * 0.05 + 0.2 }}
        className="py-2"
      >
        <Button
          onClick={openFileDialog}
          variant="outline"
          size="icon"
          className="shrink-0 size-20 rounded-lg relative overflow-hidden group"
        >
          <motion.div
            className="absolute inset-0 bg-primary/5"
            initial={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
          <motion.div
            whileHover={{ rotate: 90, scale: 1.1 }}
            transition={{ duration: 0.3 }}
          >
            <Plus className="size-6" />
          </motion.div>
        </Button>
      </motion.div>

      <ImageFileInput
        multiple
        inputRef={inputRef}
        onChange={onFilesSelected}
      />
    </motion.div>
  );
}
