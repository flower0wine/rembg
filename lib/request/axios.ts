import type { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import type { ApiResponse } from "@/lib/types/http";
import axios from "axios";
import { ApiError } from "./api-error";

// 使用WeakMap存储请求时间戳，避免污染axios配置
const requestTimestamps = new WeakMap<AxiosRequestConfig, Date>();

const isBrowser = typeof window !== "undefined";

// 创建axios实例
export const api = axios.create({
  baseURL: isBrowser
    ? "/api"
    : `${process.env.NEXT_PUBLIC_BACKEND_POINT}/api`,
  timeout: 600_000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器
api.interceptors.request.use(
  async (config) => {
    // Supabase 会自动处理 session 和 token，无需手动管理
    // 存储请求开始时间
    requestTimestamps.set(config, new Date());

    return config;
  },
  async (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器 - 处理通用响应格式
api.interceptors.response.use(
  async (response: AxiosResponse<ApiResponse>) => {
    // 计算请求耗时
    const endTime = new Date();
    const startTime = requestTimestamps.get(response.config);
    const duration = startTime ? endTime.getTime() - startTime.getTime() : 0;

    // 清理WeakMap中的时间戳
    requestTimestamps.delete(response.config);

    // 开发环境下打印请求日志
    if (process.env.NODE_ENV === "development") {
      console.log(
        `✅ API Request: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`,
      );
      console.log("📦 Response:", response.data);
    }

    return Promise.resolve(response);
  },
  async (error: AxiosError) => {
    // 计算请求耗时
    const endTime = new Date();
    const startTime = error.config ? requestTimestamps.get(error.config) : undefined;
    const duration = startTime ? endTime.getTime() - startTime.getTime() : 0;

    // 清理WeakMap中的时间戳
    if (error.config) {
      requestTimestamps.delete(error.config);
    }

    // 开发环境下打印错误日志
    if (process.env.NODE_ENV === "development") {
      console.error(
        `❌ API Request Failed: ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${duration}ms`,
      );
      console.error("🚨 Error:", error.response?.data || error.message);
    }

    return Promise.reject(error);
  },
);

export { ApiError };
export default api;