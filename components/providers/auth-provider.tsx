"use client";

import type { AuthError, AuthOtpResponse, AuthResponse, AuthTokenResponsePassword, GoTrueClient, OAuthResponse, Provider, ResendParams, User } from "@supabase/supabase-js";
import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import { useAuth } from "@/lib/hooks/use-auth";

export type SupabaseAuthResponse = {
  data: object;
  error: null;
} | {
  data: null;
  error: AuthError;
};

export interface AuthContextType {
  user: User | null;
  isInitAuth: boolean;
  error: Error | null;
  signInWithOAuth: (provider: Provider) => Promise<OAuthResponse>;
  signInWithOtp: (email: string, emailRedirectTo?: string) => Promise<AuthOtpResponse>;
  signInWithPassword: (email: string, password: string) => Promise<AuthTokenResponsePassword>;
  signUp: (email: string, password: string, emailRedirectTo?: string) => Promise<AuthResponse>;
  signOut: () => Promise<{
    error: AuthError | null;
  }>;
  resetPasswordForEmail: (email: string) => Promise<SupabaseAuthResponse>;
  resend: (credentials: ResendParams) => Promise<AuthOtpResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }

  return context;
}
