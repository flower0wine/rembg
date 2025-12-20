"use client";

/**
 * 图片文件输入组件 - 可复用的文件选择器
 */

import type { RefObject } from "react";
import { useRef } from "react";
import { ACCEPTED_IMAGE_TYPES } from "@/lib/constants/file-validation";

interface ImageFileInputProps {
  multiple?: boolean;
  onChange: (files: FileList | null) => void;
  inputRef?: RefObject<HTMLInputElement | null>;
}

export function ImageFileInput({
  multiple = false,
  onChange,
  inputRef: externalRef,
}: ImageFileInputProps) {
  const internalRef = useRef<HTMLInputElement>(null);
  const ref = externalRef || internalRef;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.files);
    // 重置input以允许选择相同文件
    e.target.value = "";
  };

  return (
    <input
      ref={ref}
      type="file"
      multiple={multiple}
      accept={ACCEPTED_IMAGE_TYPES.join(",")}
      onChange={handleChange}
      className="hidden"
    />
  );
}

/**
 * Hook: 使用图片文件输入
 */
export function useImageFileInput(
  onFilesSelected: (files: FileList | null) => void
) {
  const inputRef = useRef<HTMLInputElement>(null);

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  return {
    inputRef,
    openFileDialog,
    onFilesSelected,
  };
}
