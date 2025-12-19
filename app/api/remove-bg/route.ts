import type { NextRequest } from "next/server";
import type { RemoveBackgroundResponse } from "@/lib/types";

import { Buffer } from "node:buffer";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ErrorCode } from "@/lib/types";
import {
  getRecaptchaSecretKey,
  shouldBypassRecaptcha,
  verifyRecaptchaToken,
} from "@/lib/utils/recaptcha";
import { checkUsageLimit, recordUsage } from "@/lib/utils/usage-limiter";

/**
 * POST /api/remove-bg
 * Main API route for background removal
 *
 * Requirements:
 * - 4.1: Process image and return result
 * - 12.2: Check usage limits for guest users
 * - 13.1: Verify reCAPTCHA token
 *
 * Request body (multipart/form-data):
 * - image: File (optional, for file upload)
 * - imageUrl: string (optional, for URL input)
 * - captchaToken: string (required)
 * - fingerprint: string (required for guest users)
 *
 * Response: RemoveBackgroundResponse
 */
export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData();
    const image = formData.get("image") as File | null;
    const imageUrl = formData.get("imageUrl") as string | null;
    const captchaToken = formData.get("captchaToken") as string | null;
    const fingerprint = formData.get("fingerprint") as string | null;

    // Validate input
    if (!image && !imageUrl) {
      return NextResponse.json<RemoveBackgroundResponse>(
        {
          success: false,
          error: {
            code: ErrorCode.INVALID_FILE_TYPE,
            message: "Either image file or image URL is required",
          },
        },
        { status: 400 },
      );
    }

    if (!captchaToken) {
      return NextResponse.json<RemoveBackgroundResponse>(
        {
          success: false,
          error: {
            code: ErrorCode.CAPTCHA_FAILED,
            message: "reCAPTCHA token is required",
          },
        },
        { status: 400 },
      );
    }

    if (!fingerprint) {
      return NextResponse.json<RemoveBackgroundResponse>(
        {
          success: false,
          error: {
            code: ErrorCode.API_ERROR,
            message: "Browser fingerprint is required",
          },
        },
        { status: 400 },
      );
    }

    // Get current user session
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Check usage limit (Requirement 12.2)
    const limitCheck = await checkUsageLimit(fingerprint, user?.id);

    if (!limitCheck.canProcess) {
      return NextResponse.json<RemoveBackgroundResponse>(
        {
          success: false,
          error: {
            code: ErrorCode.USAGE_LIMIT_EXCEEDED,
            message: limitCheck.message || "Usage limit exceeded. Please login to continue.",
          },
        },
        { status: 403 },
      );
    }

    // Verify reCAPTCHA (Requirement 13.1)
    // Skip verification for logged-in verified users
    if (!shouldBypassRecaptcha(user?.id, true)) {
      const secretKey = getRecaptchaSecretKey();
      if (!secretKey) {
        console.error("RECAPTCHA_SECRET_KEY is not configured");
        return NextResponse.json<RemoveBackgroundResponse>(
          {
            success: false,
            error: {
              code: ErrorCode.CAPTCHA_FAILED,
              message: "reCAPTCHA is not configured",
            },
          },
          { status: 500 },
        );
      }

      const captchaResult = await verifyRecaptchaToken(captchaToken, secretKey);

      if (!captchaResult.success) {
        return NextResponse.json<RemoveBackgroundResponse>(
          {
            success: false,
            error: {
              code: ErrorCode.CAPTCHA_FAILED,
              message: captchaResult.error || "reCAPTCHA verification failed",
            },
          },
          { status: 403 },
        );
      }
    }

    // Process the image (Requirement 4.1)
    let processedImageData: {
      processedImage: string;
      originalSize: { width: number; height: number };
      processedSize: { width: number; height: number };
    };

    try {
      if (image) {
        processedImageData = await processImageFile(image);
      }
      else if (imageUrl) {
        processedImageData = await processImageUrl(imageUrl);
      }
      else {
        throw new Error("No image provided");
      }
    }
    catch (error) {
      console.error("Error processing image:", error);
      return NextResponse.json<RemoveBackgroundResponse>(
        {
          success: false,
          error: {
            code: ErrorCode.API_ERROR,
            message: error instanceof Error ? error.message : "Failed to process image",
          },
        },
        { status: 500 },
      );
    }

    // Record usage after successful processing
    await recordUsage(fingerprint, user?.id);

    // Save to processing history if user is logged in
    let historyId: string | undefined;
    if (user) {
      try {
        const filename = image?.name || new URL(imageUrl!).pathname.split("/").pop() || "image.png";
        const fileSize = image?.size || 0;

        // TODO: Upload images to Supabase Storage and get URLs
        // For now, we'll skip history recording until storage is implemented
        // const { data: historyRecord, error: historyError } = await supabase
        //   .from("processing_history")
        //   .insert({
        //     user_id: user.id,
        //     original_image_url: "placeholder",
        //     processed_image_url: "placeholder",
        //     original_filename: filename,
        //     file_size: fileSize,
        //   })
        //   .select("id")
        //   .single();

        // if (!historyError && historyRecord) {
        //   historyId = historyRecord.id;
        // }
      }
      catch (error) {
        console.error("Error saving to history:", error);
        // Don't fail the request if history saving fails
      }
    }

    // Return success response
    return NextResponse.json<RemoveBackgroundResponse>({
      success: true,
      data: {
        ...processedImageData,
        historyId,
      },
    });
  }
  catch (error) {
    console.error("Error in remove-bg API:", error);
    return NextResponse.json<RemoveBackgroundResponse>(
      {
        success: false,
        error: {
          code: ErrorCode.API_ERROR,
          message: "Internal server error",
        },
      },
      { status: 500 },
    );
  }
}

/**
 * Process an image file for background removal
 * This function calls the external background removal API
 *
 * @param file - The image file to process
 * @returns Processed image data with base64 encoded PNG
 */
async function processImageFile(file: File): Promise<{
  processedImage: string;
  originalSize: { width: number; height: number };
  processedSize: { width: number; height: number };
}> {
  // Get the cloud API configuration
  const apiKey = process.env.BG_REMOVAL_API_KEY;
  const apiUrl = process.env.BG_REMOVAL_API_URL || "https://api.remove.bg/v1.0/removebg";

  if (!apiKey) {
    throw new Error("Background removal API key is not configured");
  }

  // Convert file to buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Call the background removal API
  // This is a generic implementation that works with remove.bg API
  // Adjust based on your actual cloud API provider
  const formData = new FormData();
  formData.append("image_file", new Blob([buffer]), file.name);
  formData.append("size", "auto");

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "X-Api-Key": apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Background removal API error: ${response.status} - ${errorText}`);
  }

  // Get the processed image
  const processedBuffer = await response.arrayBuffer();
  const base64Image = Buffer.from(processedBuffer).toString("base64");

  // Get image dimensions (simplified - in production, use sharp or similar)
  // For now, return placeholder dimensions
  const originalSize = { width: 1000, height: 1000 };
  const processedSize = { width: 1000, height: 1000 };

  return {
    processedImage: `data:image/png;base64,${base64Image}`,
    originalSize,
    processedSize,
  };
}

/**
 * Process an image from URL for background removal
 *
 * @param url - The image URL to process
 * @returns Processed image data with base64 encoded PNG
 */
async function processImageUrl(url: string): Promise<{
  processedImage: string;
  originalSize: { width: number; height: number };
  processedSize: { width: number; height: number };
}> {
  // Get the cloud API configuration
  const apiKey = process.env.BG_REMOVAL_API_KEY;
  const apiUrl = process.env.BG_REMOVAL_API_URL || "https://api.remove.bg/v1.0/removebg";

  if (!apiKey) {
    throw new Error("Background removal API key is not configured");
  }

  // Call the background removal API with URL
  const formData = new FormData();
  formData.append("image_url", url);
  formData.append("size", "auto");

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "X-Api-Key": apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Background removal API error: ${response.status} - ${errorText}`);
  }

  // Get the processed image
  const processedBuffer = await response.arrayBuffer();
  const base64Image = Buffer.from(processedBuffer).toString("base64");

  // Get image dimensions (simplified - in production, use sharp or similar)
  const originalSize = { width: 1000, height: 1000 };
  const processedSize = { width: 1000, height: 1000 };

  return {
    processedImage: `data:image/png;base64,${base64Image}`,
    originalSize,
    processedSize,
  };
}
