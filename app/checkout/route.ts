import type { NextRequest } from "next/server";
import { Checkout } from "@creem_io/nextjs";
import { NextResponse } from "next/server";
import { ROUTES } from "@/lib/constants/routes";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  // 创建 Supabase 客户端
  const supabase = await createClient();

  // 获取用户认证信息
  const { data, error } = await supabase.auth.getClaims();

  const user = data?.claims;

  // 如果未登录或获取用户信息失败，重定向到登录页
  if (error || !user) {
    const redirectUrl = new URL(ROUTES.LOGIN, request.url);
    // 将当前请求的完整 URL 作为回调参数
    redirectUrl.searchParams.set("redirectTo", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // 用户已登录，继续执行 Checkout
  const checkoutHandler = Checkout({
    apiKey: process.env.CREEM_API_KEY!,
    testMode: process.env.NODE_ENV !== "production",
    defaultSuccessUrl: "/thank-you",
  });

  return checkoutHandler(request);
}
