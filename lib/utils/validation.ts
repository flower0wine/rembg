import { z } from "zod/v4";

import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from "@/lib/types";

/**
 * Zod schema for file validation
 * Validates file size (max 10MB) and file type (PNG, JPG, JPEG, WebP)
 */
export const fileValidationSchema = z.object({
  size: z
    .number()
    .max(MAX_FILE_SIZE, "文件大小不能超过10MB"),
  type: z.enum(ACCEPTED_IMAGE_TYPES, {
    error: "仅支持PNG、JPG、JPEG、WebP格式",
  }),
});

/**
 * Zod schema for URL validation
 * Validates that the input is a properly formatted URL
 */
export const urlValidationSchema = z.url("请输入有效的URL地址");

/**
 * Type for file validation input
 */
export type FileValidationInput = z.infer<typeof fileValidationSchema>;

/**
 * Validation result type
 */
export interface ValidationResult {
  success: boolean;
  error?: string;
}

/**
 * Validates a file against size and type constraints
 * @param file - The file to validate
 * @returns ValidationResult with success status and optional error message
 */
export function validateFile(file: File): ValidationResult {
  const result = fileValidationSchema.safeParse({
    size: file.size,
    type: file.type,
  });

  if (!result.success) {
    const firstError = result.error.issues[0];
    return {
      success: false,
      error: firstError?.message || "文件验证失败",
    };
  }

  return { success: true };
}


/**
 * Validates a URL string
 * @param url - The URL string to validate
 * @returns ValidationResult with success status and optional error message
 */
export function validateUrl(url: string): ValidationResult {
  const result = urlValidationSchema.safeParse(url);

  if (!result.success) {
    return {
      success: false,
      error: "请输入有效的URL地址",
    };
  }

  return { success: true };
}

/**
 * Checks if a file size exceeds the maximum allowed size
 * @param size - File size in bytes
 * @returns true if file size exceeds limit
 */
export function isFileTooLarge(size: number): boolean {
  return size > MAX_FILE_SIZE;
}

/**
 * Checks if a file type is in the accepted list
 * @param type - MIME type of the file
 * @returns true if file type is accepted
 */
export function isValidFileType(type: string): boolean {
  return (ACCEPTED_IMAGE_TYPES as readonly string[]).includes(type);
}

/**
 * Gets the first valid image file from a list of files
 * Used for drag-and-drop handling where multiple files may be dropped
 * @param files - Array of files
 * @returns The first valid image file or null if none found
 */
export function getFirstValidImageFile(files: File[]): File | null {
  for (const file of files) {
    if (isValidFileType(file.type)) {
      return file;
    }
  }
  return null;
}

/**
 * Formats file size for display
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0)
    return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}
