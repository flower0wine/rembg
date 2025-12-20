/**
 * React Query hook for single image background removal
 * Requirements: 4.1
 */

"use client";

import type { UseMutationResult } from "@tanstack/react-query";
import type { RemoveBackgroundRequest, RemoveBackgroundResponse } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";

import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

import { removeBackground } from "@/lib/api/background-removal";
import { getSessionFingerprint } from "@/lib/utils/fingerprint.util";

/**
 * Input for background removal mutation
 */
export interface BackgroundRemovalInput {
  image: File | string;
}

/**
 * Hook for single image background removal
 * Automatically handles reCAPTCHA token generation
 *
 * @param options - Optional mutation options
 * @param options.onSuccess - Callback function called on successful background removal
 * @param options.onError - Callback function called on error
 * @returns UseMutationResult for background removal operation
 */
export function useBackgroundRemoval(
  options?: {
    onSuccess?: (data: RemoveBackgroundResponse) => void;
    onError?: (error: Error) => void;
  },
): UseMutationResult<
  RemoveBackgroundResponse,
  Error,
  BackgroundRemovalInput
> {
  const { executeRecaptcha } = useGoogleReCaptcha();

  return useMutation({
    mutationFn: async (input: BackgroundRemovalInput) => {
      // Generate reCAPTCHA token
      if (!executeRecaptcha) {
        throw new Error("reCAPTCHA not available");
      }

      const captchaToken = await executeRecaptcha("remove_background");

      // Get browser fingerprint
      const fingerprint = await getSessionFingerprint();

      // Call API
      const request: RemoveBackgroundRequest = {
        image: input.image,
        captchaToken,
      };

      return removeBackground(request, fingerprint);
    },
    retry: false, // Don't retry on failure (already handled by axios client)
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}
