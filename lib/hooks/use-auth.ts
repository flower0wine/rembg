import type { AuthChangeEvent, Provider, ResendParams, Session, User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { API_PATHS } from "../constants/api";
import { createClient } from "../supabase/client";

/**
 * 该 Hook 最好只在 Context 当中使用
 */
export function useAuth() {
  const supabase = createClient();
  const [isInitAuth, setIsInitAuth] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const listenAuthStateChange = () => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        const user = session?.user || null;

        setUser(user);

        if (event === "INITIAL_SESSION") {
          setIsInitAuth(true);
        }
        else if (event === "SIGNED_IN") {
          //
        }
        else if (event === "SIGNED_OUT") {
          // setAuthUser();
        }
        else if (event === "USER_UPDATED"
          || event === "PASSWORD_RECOVERY") {
          // nothing to do ...
        }
      }
    );

    return () => subscription.unsubscribe();
  };

  useEffect(() => {
    const unsubscribe = listenAuthStateChange();

    return () => unsubscribe();
  }, []);

  /**
   * 第三方登录
   * @param provider
   */
  const signInWithOAuth = async (provider: Provider) => {
    return supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}${API_PATHS.AUTH_CALLBACK}`,
      },
    });
  };

  const signOut = async () => {
    return supabase.auth.signOut();
  };

  /**
   * 验证码登录
   * @param email
   * @param emailRedirectTo
   */
  const signInWithOtp = async (email: string, emailRedirectTo?: string) => {
    return supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo,
      },
    });
  };

  /**
   * 邮箱密码登录
   * @param email
   * @param password
   */
  const signInWithPassword = async (email: string, password: string) => {
    return supabase.auth.signInWithPassword({
      email,
      password,
    });
  };

  /**
   * 邮箱密码注册
   * @param email
   * @param password
   * @param emailRedirectTo
   */
  const signUp = async (email: string, password: string, emailRedirectTo?: string) => {
    return supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
      },
    });
  };

  const resetPasswordForEmail = async (email: string) => {
    return supabase.auth.resetPasswordForEmail(email);
  };

  const resend = async (credentials: ResendParams) => {
    return supabase.auth.resend(credentials);
  };

  return {
    user,
    isInitAuth,
    signInWithOAuth,
    signInWithOtp,
    signInWithPassword,
    signUp,
    signOut,
    resetPasswordForEmail,
    resend,
  };
}
