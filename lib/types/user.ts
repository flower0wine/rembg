/**
 * User and authentication related type definitions
 */

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface UsageRecord {
  id: string;
  user_id?: string;
  fingerprint?: string;
  created_at: string;
}

export interface UsageLimitResult {
  canProcess: boolean;
  remainingCount: number;
  requiresLogin: boolean;
  message?: string;
}
