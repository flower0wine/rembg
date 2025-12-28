/**
 * 图片存储相关的服务端API调用
 */

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { r2Client } from "@/lib/utils/r2";

const bucket = process.env.R2_BUCKET_NAME!;
const imageDomain = process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN!;

if (!bucket) {
  throw new Error("R2_BUCKET_NAME environment variable is missing");
}

if (!imageDomain) {
  throw new Error("NEXT_PUBLIC_R2_PUBLIC_DOMAIN environment variable is missing");
}

/**
 * 直接上传图片到R2存储
 * @param imageData 图片数据
 * @param key 存储路径
 * @param contentType 文件类型
 * @returns 上传后的URL
 */
export async function uploadImageToR2(
  imageData: ReadableStream<Uint8Array<ArrayBufferLike>>,
  key: string,
  contentType: string
): Promise<string> {
  try {
    // const command = new PutObjectCommand({
    //   Bucket: process.env.R2_BUCKET_NAME,
    //   Key: key,
    //   Body: imageData,
    //   ContentType: contentType,
    // });

    // await r2Client.send(command);
    const upload = new Upload({
      client: r2Client,
      params: {
        Bucket: bucket,
        Key: key,
        ContentType: contentType,
        Body: imageData, // 可以是 Node.js stream、browser File stream 等
      },
    });

    await upload.done();

    return `${imageDomain}/${key}`;
  }
  catch (error) {
    console.error("上传图片到R2失败:", error);
    throw new Error("图片上传失败");
  }
}
