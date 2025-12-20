/**
 * API request and response type definitions
 */

export interface RemoveBackgroundRequest {
  image: File | string; // File object or URL
  captchaToken: string; // reCAPTCHA token
}

export interface RemoveBackgroundResponse {
  success: boolean;
  data?: {
    processedImage: string; // base64 encoded PNG image
    originalSize: { width: number; height: number };
    processedSize: { width: number; height: number };
    historyId?: string; // History record ID (logged-in users)
  };
  error?: {
    code: string;
    message: string;
  };
}
