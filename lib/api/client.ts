/**
 * Axios client configuration with interceptors, error handling, and retry logic
 * Requirements: 4.3
 */

import type { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import type { AppError } from "@/lib/types";

import axios from "axios";
import { ErrorCode } from "@/lib/types";

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }

  toAppError(): AppError {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}

/**
 * Retry configuration
 */
interface RetryConfig {
  retries: number;
  retryDelay: number;
  retryCondition?: (error: AxiosError) => boolean;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  retries: 3,
  retryDelay: 1000,
  retryCondition: (error: AxiosError) => {
    // Retry on network errors or 5xx server errors
    return !error.response || (error.response.status >= 500 && error.response.status < 600);
  },
};

/**
 * Create axios instance with base configuration
 */
function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "/api",
    timeout: 30000, // 30 seconds
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Add timestamp to prevent caching
      config.params = {
        ...config.params,
        _t: Date.now(),
      };

      return config;
    },
    async (error: AxiosError) => {
      return Promise.reject(error);
    },
  );

  // Response interceptor
  client.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error: AxiosError) => {
      const config = error.config as AxiosRequestConfig & { _retry?: number };

      // Handle retry logic
      if (config && DEFAULT_RETRY_CONFIG.retryCondition?.(error)) {
        config._retry = config._retry || 0;

        if (config._retry < DEFAULT_RETRY_CONFIG.retries) {
          config._retry += 1;

          // Exponential backoff
          const delay = DEFAULT_RETRY_CONFIG.retryDelay * 2 ** (config._retry - 1);
          await new Promise(resolve => setTimeout(resolve, delay));

          return client.request(config);
        }
      }

      // Transform error to ApiError
      return Promise.reject(transformError(error));
    },
  );

  return client;
}

/**
 * Transform axios error to ApiError
 */
function transformError(error: AxiosError): ApiError {
  // Network error
  if (!error.response) {
    return new ApiError(
      ErrorCode.NETWORK_ERROR,
      "网络连接失败，请检查您的网络连接",
      { originalError: error.message },
    );
  }

  // API error response
  const { status, data } = error.response;

  // Handle specific status codes
  switch (status) {
    case 401:
      return new ApiError(
        ErrorCode.AUTH_REQUIRED,
        "需要登录才能继续操作",
        data,
      );

    case 403:
      return new ApiError(
        ErrorCode.USAGE_LIMIT_EXCEEDED,
        "已达到使用限制，请登录以继续使用",
        data,
      );

    case 413:
      return new ApiError(
        ErrorCode.FILE_TOO_LARGE,
        "文件大小超过限制",
        data,
      );

    case 422:
      return new ApiError(
        ErrorCode.INVALID_FILE_TYPE,
        "不支持的文件格式",
        data,
      );

    case 429:
      return new ApiError(
        ErrorCode.USAGE_LIMIT_EXCEEDED,
        "请求过于频繁，请稍后再试",
        data,
      );

    case 500:
    case 502:
    case 503:
    case 504:
      return new ApiError(
        ErrorCode.API_ERROR,
        "服务器错误，请稍后重试",
        data,
      );

    default: {
      const message = typeof data === "object" && data !== null && "message" in data
        ? String(data.message)
        : "处理请求时发生错误";
      return new ApiError(
        ErrorCode.API_ERROR,
        message,
        data,
      );
    }
  }
}

/**
 * Singleton axios client instance
 */
export const apiClient = createApiClient();

/**
 * Helper function to handle API errors in components
 */
export function handleApiError(error: unknown): AppError {
  if (error instanceof ApiError) {
    return error.toAppError();
  }

  if (error instanceof Error) {
    return {
      code: ErrorCode.API_ERROR,
      message: error.message,
    };
  }

  return {
    code: ErrorCode.API_ERROR,
    message: "发生未知错误",
    details: error,
  };
}
