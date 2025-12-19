import * as Sentry from "@sentry/nextjs";

/**
 * Initialize Sentry error monitoring
 * This should be called in sentry.client.config.ts and sentry.server.config.ts
 */
export function initSentry() {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,

    // Performance monitoring sample rate
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Enable debug mode in development
    debug: process.env.NODE_ENV === "development",

    // Disable Sentry in development if no DSN is provided
    enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  });
}

/**
 * Capture an exception with optional context
 */
export function captureError(
  error: Error,
  context?: Record<string, unknown>
) {
  if (context) {
    Sentry.setContext("error_context", context);
  }
  Sentry.captureException(error);
}

/**
 * Set context for image processing operations
 */
export function setImageProcessingContext(data: {
  fileSize?: number;
  fileType?: string;
  processingMode?: "single" | "batch";
  batchSize?: number;
}) {
  Sentry.setContext("image_processing", data);
}

/**
 * Set user context for authenticated users
 */
export function setUserContext(user: {
  id: string;
  email?: string;
}) {
  Sentry.setUser(user);
}

/**
 * Clear user context on logout
 */
export function clearUserContext() {
  Sentry.setUser(null);
}
