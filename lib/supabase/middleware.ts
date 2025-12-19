import type { NextRequest } from "next/server";
import type { Database } from "./types";
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { ROUTES } from "@/lib/constants/routes";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refreshing the auth token
  // This will refresh the session if it's expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes that require authentication
  const protectedRoutes = [ROUTES.HISTORY, ROUTES.APP];
  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route),
  );

  // Redirect to login if accessing protected route without authentication
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.LOGIN;
    url.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Redirect to app if accessing auth pages while authenticated
  const authRoutes = [ROUTES.LOGIN, ROUTES.REGISTER];
  const isAuthRoute = authRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route),
  );

  if (isAuthRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.APP;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
