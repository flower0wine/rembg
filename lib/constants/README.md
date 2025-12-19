# 路由常量

## 概述

`routes.ts` 文件集中管理应用中的所有路由路径，避免硬编码字符串导致的拼写错误和维护困难。

## 使用方法

### 导入路由常量

```typescript
import { ROUTES } from "@/lib/constants/routes";
```

### 在组件中使用

```typescript
// ❌ 不推荐：硬编码字符串
<Link href="/app">背景移除</Link>
router.push("/login");

// ✅ 推荐：使用路由常量
<Link href={ROUTES.APP}>背景移除</Link>
router.push(ROUTES.LOGIN);
```

### 在中间件中使用

```typescript
import { ROUTES, isProtectedRoute, isAuthRoute } from "@/lib/constants/routes";

// 检查是否为受保护的路由
if (isProtectedRoute(pathname)) {
  // 重定向到登录页
  url.pathname = ROUTES.LOGIN;
}

// 检查是否为认证页面
if (isAuthRoute(pathname)) {
  // 重定向到应用页面
  url.pathname = ROUTES.APP;
}
```

## 可用路由

### 公共页面
- `ROUTES.HOME` - 首页 (`/`)
- `ROUTES.PRICING` - 定价页面 (`/pricing`)

### 认证相关
- `ROUTES.LOGIN` - 登录页面 (`/login`)
- `ROUTES.REGISTER` - 注册页面 (`/register`)

### 应用功能
- `ROUTES.APP` - 背景移除工具 (`/app`)
- `ROUTES.HISTORY` - 处理历史 (`/history`)

## 工具函数

### `isProtectedRoute(pathname: string): boolean`
检查给定路径是否为受保护的路由（需要登录）。

```typescript
if (isProtectedRoute("/app")) {
  // 需要登录
}
```

### `isAuthRoute(pathname: string): boolean`
检查给定路径是否为认证页面（登录后不可访问）。

```typescript
if (isAuthRoute("/login")) {
  // 已登录用户不应访问
}
```

## 添加新路由

在 `routes.ts` 中添加新路由：

```typescript
export const ROUTES = {
  // ... 现有路由
  NEW_ROUTE: "/new-route",
} as const;
```

如果是受保护的路由，添加到 `PROTECTED_ROUTES` 数组：

```typescript
export const PROTECTED_ROUTES: Route[] = [
  ROUTES.APP,
  ROUTES.HISTORY,
  ROUTES.NEW_ROUTE, // 新增
];
```

## 优势

1. **类型安全**：TypeScript 会检查路由是否存在
2. **自动补全**：IDE 会提供路由建议
3. **易于重构**：修改路由只需在一处更改
4. **避免拼写错误**：不会因为手误写错路径
5. **集中管理**：所有路由一目了然
