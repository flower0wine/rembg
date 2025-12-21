import type { JWTPayload } from "@/lib/types";
import jwt from "jsonwebtoken";
import "server-only";


const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d"; // Token expires in 7 days

/**
 * Generate JWT token with user subscription info
 */
export function generateToken(payload: Omit<JWTPayload, "iat" | "exp">): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  }
  catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error("JWT token expired:", error);
      return null;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      console.error("JWT verification failed:", error);
      return null;
    }
    console.error("JWT verification error:", error);
    return null;
  }
}

/**
 * Decode JWT token without verification (for debugging)
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  }
  catch (error) {
    console.error("JWT decode failed:", error);
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    if (!decoded || !decoded.exp) {
      return true;
    }
    return Date.now() >= decoded.exp * 1000;
  }
  catch {
    return true;
  }
}
