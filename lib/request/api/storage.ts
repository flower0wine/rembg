/**
 * 图片存储相关的服务端API调用
 */

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2Client } from "@/lib/utils/r2";

/**
 * 直接上传图片到R2存储
 * @param imageBuffer 图片数据
 * @param key 存储路径
 * @param contentType 文件类型
 * @returns 上传后的URL
 */
export async function uploadImageToR2(
  imageBuffer: ArrayBuffer,
  key: string,
  contentType: string
): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: new Uint8Array(imageBuffer),
      ContentType: contentType,
    });

    await r2Client.send(command);

    return `${process.env.R2_PUBLIC_DOMAIN}/${key}`;
  }
  catch (error) {
    console.error("上传图片到R2失败:", error);
    throw new Error("图片上传失败");
  }
}
