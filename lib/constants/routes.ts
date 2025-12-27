/**
 * 应用路由常量
 * 集中管理所有路由路径，避免硬编码字符串导致的错误
 */

export const ROUTES = {
  // 公共页面
  HOME: "/",
  PRICING: "/pricing",

  // 认证相关
  LOGIN: "/login",
  REGISTER: "/register",

  // 应用功能
  APP: "/app",
  HISTORY: "/history",

  VERIFY_EMAIL: "/verify-email",

  SUBSCRIPTION_CHECKOUT: "/subscription/checkout",
} as const;

/**
 * 路由类型
 */
export type Route = typeof ROUTES[keyof typeof ROUTES];

/**
 * 受保护的路由（需要登录）
 */
export const PROTECTED_ROUTES: Route[] = [
  ROUTES.APP,
  ROUTES.HISTORY,
];

/**
 * 认证页面路由（登录后不可访问）
 */
export const AUTH_ROUTES: Route[] = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
];

/**
 * 检查是否为受保护的路由
 */
export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * 检查是否为认证页面路由
 */
export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(route => pathname.startsWith(route));
}
