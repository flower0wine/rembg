/**
 * Error related type definitions
 */

export enum ErrorCode {
  FILE_TOO_LARGE = "FILE_TOO_LARGE",
  INVALID_FILE_TYPE = "INVALID_FILE_TYPE",
  INVALID_URL = "INVALID_URL",
  NETWORK_ERROR = "NETWORK_ERROR",
  API_ERROR = "API_ERROR",
  DOWNLOAD_ERROR = "DOWNLOAD_ERROR",
  CAPTCHA_FAILED = "CAPTCHA_FAILED",
  USAGE_LIMIT_EXCEEDED = "USAGE_LIMIT_EXCEEDED",
  AUTH_REQUIRED = "AUTH_REQUIRED",
  SESSION_EXPIRED = "SESSION_EXPIRED",
}

export interface AppError {
  code: ErrorCode;
  message: string;
  details?: unknown;
}
