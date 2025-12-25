import type { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import type { ApiResponse } from "@/lib/types/http";
import axios from "axios";
import { ROUTES } from "../constants/routes";
import { getToken, setToken } from "../utils/browser";
import { ApiError } from "./api-error";
import { refreshToken } from "./token";

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

// Token刷新相关状态
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
}

// 检查token是否过期（调用服务端API）
async function checkTokenExpired(token: string): Promise<boolean> {
  try {
    const response = await fetch("/api/subscription/verify-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      return true; // 如果请求失败，假设token已过期
    }

    const data = await response.json();
    return data.expired;
  }
  catch (error) {
    console.error("Failed to verify token:", error);
    return true; // 如果出错，假设token已过期
  }
}


// 请求拦截器
api.interceptors.request.use(
  async (config) => {
    // 获取用户token
    const token = getToken();

    if (token) {
      // 检查token是否过期
      const expired = await checkTokenExpired(token);
      if (expired) {
        // 如果没有正在刷新，开始刷新
        if (!isRefreshing) {
          isRefreshing = true;
          const newToken = await refreshToken(token);
          isRefreshing = false;

          if (newToken) {
            onTokenRefreshed(newToken);
            config.headers.Authorization = `Bearer ${newToken}`;
          }
          else {
            // 刷新失败，重定向到登录页
            if (isBrowser) {
              window.location.href = ROUTES.LOGIN;
            }
            return Promise.reject(new Error("Token refresh failed"));
          }
        }
        else {
          // 等待刷新完成
          return new Promise((resolve) => {
            subscribeTokenRefresh((newToken: string) => {
              config.headers.Authorization = `Bearer ${newToken}`;
              resolve(config);
            });
          });
        }
      }
      else {
        // Token未过期，直接使用
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

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

    // 处理401错误（未授权）
    if (error.response?.status === 401 && error.config) {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
      const token = getToken();

      // 如果还没有重试过
      if (!originalRequest._retry && token) {
        originalRequest._retry = true;

        // 如果没有正在刷新token
        if (!isRefreshing) {
          isRefreshing = true;
          const newToken = await refreshToken(token);
          isRefreshing = false;

          if (newToken) {
            onTokenRefreshed(newToken);
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
          else {
            // 刷新失败，清除token并重定向到登录页
            if (isBrowser) {
              setToken();
              window.location.href = ROUTES.LOGIN;
            }
            return Promise.reject(error);
          }
        }

        // 等待刷新完成
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken: string) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }
    }

    return Promise.reject(error);
  },
);

export { ApiError };
export default api;