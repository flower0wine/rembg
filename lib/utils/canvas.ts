/**
 * Canvas utilities for image processing
 */

/**
 * 创建透明背景图案（棋盘格）
 * @param width - 图片宽度
 * @param height - 图片高度
 * @param squareSize - 每个方格的大小（默认 10px）
 * @returns Data URL of the checkered background
 */
export function createCheckeredBackground(
  width: number,
  height: number,
  squareSize: number = 10
): string {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  // 浅灰色和白色交替
  const color1 = "#ffffff";
  const color2 = "#e5e5e5";

  for (let y = 0; y < height; y += squareSize) {
    for (let x = 0; x < width; x += squareSize) {
      const isEvenRow = Math.floor(y / squareSize) % 2 === 0;
      const isEvenCol = Math.floor(x / squareSize) % 2 === 0;
      ctx.fillStyle = isEvenRow === isEvenCol ? color1 : color2;
      ctx.fillRect(x, y, squareSize, squareSize);
    }
  }

  return canvas.toDataURL();
}

/**
 * 获取图片的实际尺寸
 * @param src - 图片 URL
 * @returns Promise with width and height
 */
export async function getImageDimensions(
  src: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * 计算适应容器的图片尺寸（保持宽高比）
 * @param imageWidth - 原始图片宽度
 * @param imageHeight - 原始图片高度
 * @param maxWidth - 最大宽度
 * @param maxHeight - 最大高度（可选）
 * @returns 计算后的宽度和高度
 */
export function calculateFitDimensions(
  imageWidth: number,
  imageHeight: number,
  maxWidth: number,
  maxHeight?: number
): { width: number; height: number } {
  const aspectRatio = imageWidth / imageHeight;

  let width = imageWidth;
  let height = imageHeight;

  // 如果图片宽度超过最大宽度
  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }

  // 如果设置了最大高度且高度超过
  if (maxHeight && height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  return { width: Math.round(width), height: Math.round(height) };
}
