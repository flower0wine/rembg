/**
 * reCAPTCHA v3 utilities for verification
 * Provides client-side token generation and server-side verification
 */

/**
 * Minimum score threshold for reCAPTCHA v3
 * Scores range from 0.0 (likely bot) to 1.0 (likely human)
 * 0.5 is a reasonable threshold for most applications
 */
export const RECAPTCHA_SCORE_THRESHOLD = 0.5;

/**
 * reCAPTCHA verification response from Google API
 */
export interface RecaptchaVerificationResponse {
  "success": boolean;
  "score"?: number;
  "action"?: string;
  "challenge_ts"?: string;
  "hostname"?: string;
  "error-codes"?: string[];
}

/**
 * Result of reCAPTCHA verification
 */
export interface RecaptchaVerificationResult {
  success: boolean;
  score?: number;
  error?: string;
}

/**
 * Verifies a reCAPTCHA token with Google's API
 * This should be called from the server-side only
 *
 * @param token - The reCAPTCHA token from the client
 * @param secretKey - The reCAPTCHA secret key from environment variables
 * @returns Verification result with success status and score
 */
export async function verifyRecaptchaToken(
  token: string,
  secretKey: string,
): Promise<RecaptchaVerificationResult> {
  if (!token) {
    return {
      success: false,
      error: "reCAPTCHA token is required",
    };
  }

  if (!secretKey) {
    return {
      success: false,
      error: "reCAPTCHA secret key is not configured",
    };
  }

  try {
    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `secret=${secretKey}&response=${token}`,
      },
    );

    if (!response.ok) {
      return {
        success: false,
        error: `reCAPTCHA verification request failed: ${response.statusText}`,
      };
    }

    const data: RecaptchaVerificationResponse = await response.json();

    // Check if verification was successful
    if (!data.success) {
      const errorCodes = data["error-codes"]?.join(", ") || "Unknown error";
      return {
        success: false,
        error: `reCAPTCHA verification failed: ${errorCodes}`,
      };
    }

    // Check score threshold
    const score = data.score ?? 0;
    if (score < RECAPTCHA_SCORE_THRESHOLD) {
      return {
        success: false,
        score,
        error: `reCAPTCHA score too low: ${score}`,
      };
    }

    return {
      success: true,
      score,
    };
  }
  catch (error) {
    return {
      success: false,
      error: `reCAPTCHA verification error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Checks if a user should bypass reCAPTCHA verification
 * Logged-in users with verified status can bypass verification
 *
 * @param userId - The user ID (undefined for guest users)
 * @param isVerified - Whether the user has verified status
 * @returns true if user can bypass reCAPTCHA
 */
export function shouldBypassRecaptcha(
  userId?: string,
  isVerified?: boolean,
): boolean {
  // Only logged-in verified users can bypass
  return Boolean(userId && isVerified);
}

/**
 * Gets the reCAPTCHA site key from environment variables
 * @returns The site key or undefined if not configured
 */
export function getRecaptchaSiteKey(): string | undefined {
  return process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
}

/**
 * Gets the reCAPTCHA secret key from environment variables
 * This should only be called from server-side code
 * @returns The secret key or undefined if not configured
 */
export function getRecaptchaSecretKey(): string | undefined {
  return process.env.RECAPTCHA_SECRET_KEY;
}
