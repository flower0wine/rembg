import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { ErrorCode } from "@/lib/types";
import {
  getRecaptchaSecretKey,
  verifyRecaptchaToken,
} from "@/lib/utils/recaptcha.util";

/**
 * Request body for reCAPTCHA verification
 */
interface VerifyCaptchaRequest {
  token: string;
}

/**
 * Response for reCAPTCHA verification
 */
interface VerifyCaptchaResponse {
  success: boolean;
  score?: number;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * POST /api/verify-captcha
 * Verifies a reCAPTCHA token from the client
 *
 * @param request - The Next.js request object
 * @returns JSON response with verification result
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: VerifyCaptchaRequest = await request.json();
    const { token } = body;

    // Validate token presence
    if (!token) {
      return NextResponse.json<VerifyCaptchaResponse>(
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

    // Get secret key from environment
    const secretKey = getRecaptchaSecretKey();
    if (!secretKey) {
      console.error("RECAPTCHA_SECRET_KEY is not configured");
      return NextResponse.json<VerifyCaptchaResponse>(
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

    // Verify the token
    const result = await verifyRecaptchaToken(token, secretKey);

    if (!result.success) {
      return NextResponse.json<VerifyCaptchaResponse>(
        {
          success: false,
          score: result.score,
          error: {
            code: ErrorCode.CAPTCHA_FAILED,
            message: result.error || "reCAPTCHA verification failed",
          },
        },
        { status: 403 },
      );
    }

    // Return success response
    return NextResponse.json<VerifyCaptchaResponse>({
      success: true,
      score: result.score,
    });
  }
  catch (error) {
    console.error("Error verifying reCAPTCHA:", error);
    return NextResponse.json<VerifyCaptchaResponse>(
      {
        success: false,
        error: {
          code: ErrorCode.CAPTCHA_FAILED,
          message: "Failed to verify reCAPTCHA",
        },
      },
      { status: 500 },
    );
  }
}
