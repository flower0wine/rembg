import type { AxiosError } from "axios";
import api from "../axios";

/**
 * 背景移除错误类
 */
export class RembgError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = "RembgError";
  }
}

/**
 * 移除图片背景
 * @param imageFile 图片文件
 * @returns 处理后的图片 Blob
 */
export async function removeBackground(imageFile: File): Promise<Blob> {
  try {
    const response = await api.post("/rembg", imageFile, {
      headers: {
        "Content-Type": imageFile.type,
      },
      responseType: "blob",
    });

    return response.data;
  }
  catch (error) {
    const axiosError = error as AxiosError<any>;

    // 根据不同的错误状态码返回不同的错误
    switch (axiosError.response?.status) {
      case 401:
        throw new Error("请先登录后再使用背景移除功能");
      case 403:
        throw new Error("订阅已过期，请续费后继续使用");
      case 413:
        throw new Error(`文件大小超出限制, 请升级订阅或使用更小的图片`);
      case 429:
        throw new Error(`已达到使用额度上限, 请升级订阅`);
      case 400:
        throw new Error("图片格式不正确, 请使用 Png, Jepg, Jpg, Webp 格式的图片");
      default:
        throw new Error("我们这边出了一点问题，请稍后重试");
    }
  }
}

/**
 * 移除图片背景（通过 URL）
 * @param imageUrl 图片 URL
 * @returns 处理后的图片 Blob
 */
export async function removeBackgroundFromUrl(imageUrl: string): Promise<Blob> {
  try {
    // 先获取图片
    const imageResponse = await fetch(imageUrl);

    if (!imageResponse.ok) {
      throw new RembgError(
        "无法获取图片，请检查图片 URL",
        "FETCH_IMAGE_ERROR"
      );
    }

    const imageBlob = await imageResponse.blob();

    // 转换为 File 对象
    const imageFile = new File([imageBlob], "image.jpg", { type: imageBlob.type });

    return await removeBackground(imageFile);
  }
  catch (error) {
    if (error instanceof RembgError) {
      throw error;
    }
    throw new RembgError(
      "获取图片失败，请检查 URL 是否正确",
      "FETCH_IMAGE_ERROR"
    );
  }
}
