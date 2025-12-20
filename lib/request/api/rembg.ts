import api from "../axios";

/**
 * 移除图片背景
 * @param imageFile 图片文件
 * @returns 处理后的图片 Blob
 */
export async function removeBackground(imageFile: File): Promise<Blob> {
  const response = await api.post("/rembg", imageFile, {
    headers: {
      "Content-Type": imageFile.type,
    },
    responseType: "blob",
  });

  return response.data;
}

/**
 * 移除图片背景（通过 URL）
 * @param imageUrl 图片 URL
 * @returns 处理后的图片 Blob
 */
export async function removeBackgroundFromUrl(imageUrl: string): Promise<Blob> {
  // 先获取图片
  const imageResponse = await fetch(imageUrl);
  const imageBlob = await imageResponse.blob();
  
  // 转换为 File 对象
  const imageFile = new File([imageBlob], "image.jpg", { type: imageBlob.type });
  
  return removeBackground(imageFile);
}
