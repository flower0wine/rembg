import type { RembgResponse } from "@/lib/types/rembg";
import api from "../axios";


/**
 * 移除图片背景
 * @param imageFile 图片文件
 * @param turnstileToken Turnstile 验证 token
 * @returns 处理后的图片 Blob
 */
export async function removeBackground(imageFile: File, turnstileToken?: string): Promise<RembgResponse> {
  const response = await api.post("/rembg", imageFile, {
    headers: {
      "Content-Type": imageFile.type,
      "X-Original-Filename": imageFile.name,
      "X-Original-File-Size": imageFile.size,
      ...(turnstileToken && { "X-Turnstile-Token": turnstileToken }),
    },
  });

  return response.data;
}
