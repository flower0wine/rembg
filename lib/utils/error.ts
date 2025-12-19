/**
 * Normalizes unknown errors into Error instances
 * @param error - The error to normalize (can be any type)
 * @param defaultMessage - Optional default message if error is not an Error instance
 * @returns A proper Error instance
 */
export function normalizeError(
  error: unknown,
  defaultMessage = "Unknown error"
): Error {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === "string") {
    return new Error(error);
  }

  if (error && typeof error === "object" && "message" in error) {
    return new Error(String(error.message));
  }

  return new Error(defaultMessage);
}

/**
 * Safely extracts error message from unknown error types
 * @param error - The error to extract message from
 * @param fallback - Fallback message if extraction fails
 * @returns The error message string
 */
export function getErrorMessage(
  error: unknown,
  fallback = "An error occurred"
): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }

  return fallback;
}
