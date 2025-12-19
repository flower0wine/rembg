/**
 * Download utilities for the Background Removal System
 * Handles file downloads with proper naming and format conversion
 */

/**
 * Generates a download filename by appending "_no_bg" suffix before the extension
 * @param originalFilename - The original filename (e.g., "photo.jpg")
 * @returns The generated filename (e.g., "photo_no_bg.png")
 *
 * **Validates: Requirements 6.2**
 */
export function generateDownloadFilename(originalFilename: string): string {
  // Remove the extension from the original filename
  const lastDotIndex = originalFilename.lastIndexOf(".");
  const nameWithoutExtension = lastDotIndex > 0
    ? originalFilename.substring(0, lastDotIndex)
    : originalFilename;

  // Return with _no_bg suffix and .png extension
  return `${nameWithoutExtension}_no_bg.png`;
}

/**
 * Downloads a base64 encoded image as a PNG file with transparency
 * @param base64Image - Base64 encoded image data (with or without data URI prefix)
 * @param filename - The filename to use for the download
 *
 * **Validates: Requirements 6.1, 6.2**
 */
export function downloadImage(base64Image: string, filename: string): void {
  try {
    // Ensure the base64 string has the proper data URI prefix
    let dataUri = base64Image;
    if (!base64Image.startsWith("data:")) {
      dataUri = `data:image/png;base64,${base64Image}`;
    }

    // Create a temporary anchor element
    const link = document.createElement("a");
    link.href = dataUri;
    link.download = filename;

    // Trigger the download
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
  }
  catch (error) {
    throw new Error("下载失败，请重试");
  }
}

/**
 * Downloads a processed image with the proper filename
 * @param base64Image - Base64 encoded processed image
 * @param originalFilename - Original filename to base the download name on
 *
 * **Validates: Requirements 6.1, 6.2**
 */
export function downloadProcessedImage(
  base64Image: string,
  originalFilename: string
): void {
  const downloadFilename = generateDownloadFilename(originalFilename);
  downloadImage(base64Image, downloadFilename);
}

/**
 * Converts a blob to base64 string
 * @param blob - The blob to convert
 * @returns Promise resolving to base64 string
 */
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Fetches an image from a URL and converts it to base64
 * @param url - The image URL
 * @returns Promise resolving to base64 string
 */
export async function fetchImageAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch image");
  }
  const blob = await response.blob();
  return blobToBase64(blob);
}
