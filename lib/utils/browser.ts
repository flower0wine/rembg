"use client";

export function isBrowser() {
  return typeof window !== "undefined";
}

export function getToken() {
  return localStorage.getItem("token");
}

/**
 * 设置或移除 token
 * @param token
 */
export function setToken(token?: string) {
  if (token) {
    localStorage.setItem("token", token);
  }
  else {
    localStorage.removeItem("token");
  }
}
