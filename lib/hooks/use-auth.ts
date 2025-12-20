"use client";

import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toError } from "@/lib/utils/error.util";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const currentUserRef = useRef<User>(undefined);

  // Initialize auth state
  useEffect(() => {
    let isInitialLoad = true;

    const initAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        setState({
          user: error ? null : user,
          loading: false,
          error: error || null
        });
      }
      catch (error) {
        setState({
          user: null,
          loading: false,
          error: toError(error)
        });
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const newUser = session?.user ?? null;

        // Update state for all events
        setState({
          user: session?.user ?? null,
          loading: false,
          error: null,
        });

        currentUserRef.current = session?.user;

        // Define which events should trigger a router refresh
        // Only refresh on user-initiated actions that change auth state
        const shouldRefresh = !isInitialLoad && (
          (event === "SIGNED_IN" && currentUserRef.current === null && newUser !== null) // User just signed in
          || event === "SIGNED_OUT" // User just signed out
          || event === "PASSWORD_RECOVERY" // User is recovering password
          || event === "USER_UPDATED" // User profile was updated (e.g., email change)
        );

        // Don't refresh on:
        // - INITIAL_SESSION: Page load, session restoration
        // - TOKEN_REFRESHED: Automatic token refresh (happens frequently)
        // - MFA_CHALLENGE_VERIFIED: MFA verification (handled separately)

        if (shouldRefresh) {
          router.refresh();
        }

        // After the first auth state change, mark as no longer initial load
        if (isInitialLoad && (event === "INITIAL_SESSION" || event === "SIGNED_IN")) {
          isInitialLoad = false;
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  // Generic auth action handler
  const handleAuthAction = useCallback(async <T>(
    action: () => Promise<{ data?: T; error: Error | null }>,
    onSuccess?: (data: T) => void
  ) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const result = await action();

      if (result.error) {
        setState(prev => ({ ...prev, loading: false, error: result.error }));
        return { data: null, error: result.error };
      }

      setState(prev => ({ ...prev, loading: false, error: null }));
      if (result.data && onSuccess) {
        onSuccess(result.data);
      }
      return { data: result.data ?? null, error: null };
    }
    catch (error) {
      const err = toError(error);
      setState(prev => ({ ...prev, loading: false, error: err }));
      return { data: null, error: err };
    }
  }, []);

  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string) => {
    return handleAuthAction(
      async () => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        return { data, error };
      },
      data => setState(prev => ({ ...prev, user: data.user }))
    );
  }, [supabase, handleAuthAction]);

  // Sign up with email and password
  const signUp = useCallback(async (email: string, password: string) => {
    return handleAuthAction(
      async () => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        return { data, error };
      },
      data => setState(prev => ({ ...prev, user: data.user }))
    );
  }, [supabase, handleAuthAction]);

  // Sign in with OAuth provider
  const signInWithOAuth = useCallback(async (provider: "google" | "github") => {
    return handleAuthAction(async () => {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });
      return { data, error };
    });
  }, [supabase, handleAuthAction]);

  // Sign out
  const signOut = useCallback(async () => {
    const result = await handleAuthAction(async () => {
      const { error } = await supabase.auth.signOut();
      return { error };
    });

    if (!result.error) {
      setState({ user: null, loading: false, error: null });
      router.push("/");
    }

    return { error: result.error };
  }, [supabase, router, handleAuthAction]);

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    signIn,
    signUp,
    signInWithOAuth,
    signOut,
  };
}
