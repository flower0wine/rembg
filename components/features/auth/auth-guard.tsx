"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthContext } from "@/components/providers/auth-provider";
import { ROUTES } from "@/lib/constants/routes";

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  fallback?: ReactNode;
}

export function AuthGuard({
  children,
  requireAuth = true,
  redirectTo = ROUTES.LOGIN,
  fallback = null,
}: AuthGuardProps): ReactNode {
  const router = useRouter();

  const { user, isInitAuth } = useAuthContext();

  console.log(Boolean(user), isInitAuth);


  useEffect(() => {
    if (requireAuth && !user && isInitAuth) {
      router.push(redirectTo);
    }
  }, [user, requireAuth, isInitAuth]);

  // Show loading state
  if (!isInitAuth) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If auth is required but user is not logged in, show fallback
  if (requireAuth && !user) {
    return fallback || null;
  }

  return <>{children}</>;
}
