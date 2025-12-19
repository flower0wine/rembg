"use client";

import type { ReactNode } from "react";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

interface RecaptchaProviderProps {
  children: ReactNode;
}

/**
 * ReCaptcha Provider wrapper component
 * Wraps GoogleReCaptchaProvider as a client component
 * to be used in server components like layout.tsx
 */
export function RecaptchaProvider({ children }: RecaptchaProviderProps) {
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  // If no site key is configured, render children without reCAPTCHA
  if (!recaptchaSiteKey) {
    console.warn("NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not configured. reCAPTCHA will not be available.");
    return <>{children}</>;
  }

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={recaptchaSiteKey}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: "body",
      }}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
}
