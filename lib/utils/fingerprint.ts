import FingerprintJS from "@fingerprintjs/fingerprintjs";

type FingerprintAgent = Awaited<ReturnType<typeof FingerprintJS.load>>;

let fpPromise: Promise<FingerprintAgent> | null = null;

/**
 * Initialize FingerprintJS agent (singleton pattern)
 * This should be called once and reused across the application
 */
export async function initFingerprint(): Promise<FingerprintAgent> {
  if (!fpPromise) {
    fpPromise = FingerprintJS.load();
  }
  return fpPromise;
}

/**
 * Generate a unique browser fingerprint
 * This fingerprint is used to identify guest users for usage limiting
 *
 * @returns A unique fingerprint string for the current browser/device
 */
export async function generateFingerprint(): Promise<string> {
  try {
    const fp = await initFingerprint();
    const result = await fp.get();
    return result.visitorId;
  }
  catch (error) {
    console.error("Failed to generate fingerprint:", error);
    // Fallback to a random ID if fingerprinting fails
    // This ensures the app continues to work even if fingerprinting is blocked
    return `fallback-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
}

/**
 * Get or create a fingerprint and store it in sessionStorage for the current session
 * This reduces the number of fingerprint generations during a single session
 *
 * @returns The fingerprint for the current session
 */
export async function getSessionFingerprint(): Promise<string> {
  const STORAGE_KEY = "browser_fingerprint";

  // Check if we already have a fingerprint in sessionStorage
  if (typeof window !== "undefined") {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      return stored;
    }
  }

  // Generate new fingerprint
  const fingerprint = await generateFingerprint();

  // Store in sessionStorage
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(STORAGE_KEY, fingerprint);
    }
    catch (error) {
      console.warn("Failed to store fingerprint in sessionStorage:", error);
    }
  }

  return fingerprint;
}
