/**
 * Type definitions for the Background Removal System
 */

// ============================================
// Error Types
// ============================================

export enum ErrorCode {
  FILE_TOO_LARGE = "FILE_TOO_LARGE",
  INVALID_FILE_TYPE = "INVALID_FILE_TYPE",
  INVALID_URL = "INVALID_URL",
  NETWORK_ERROR = "NETWORK_ERROR",
  API_ERROR = "API_ERROR",
  DOWNLOAD_ERROR = "DOWNLOAD_ERROR",
  CAPTCHA_FAILED = "CAPTCHA_FAILED",
  USAGE_LIMIT_EXCEEDED = "USAGE_LIMIT_EXCEEDED",
  AUTH_REQUIRED = "AUTH_REQUIRED",
  SESSION_EXPIRED = "SESSION_EXPIRED",
}

export interface AppError {
  code: ErrorCode;
  message: string;
  details?: unknown;
}

// ============================================
// User & Auth Types
// ============================================

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


// ============================================
// Processing History Types
// ============================================

export interface ProcessingHistory {
  id: string;
  user_id: string;
  original_image_url: string;
  processed_image_url: string;
  original_filename: string;
  file_size: number;
  created_at: string;
}

// ============================================
// API Request/Response Types
// ============================================

export interface RemoveBackgroundRequest {
  image: File | string; // File object or URL
  captchaToken: string; // reCAPTCHA token
}

export interface RemoveBackgroundResponse {
  success: boolean;
  data?: {
    processedImage: string; // base64 encoded PNG image
    originalSize: { width: number; height: number };
    processedSize: { width: number; height: number };
    historyId?: string; // History record ID (logged-in users)
  };
  error?: {
    code: string;
    message: string;
  };
}

// ============================================
// Batch Processing Types
// ============================================

export type BatchItemStatus = "pending" | "processing" | "completed" | "error";

export interface BatchItem {
  id: string;
  filename: string;
  status: BatchItemStatus;
  progress?: number;
  originalImage?: string;
  processedImage?: string;
  error?: string;
}

export interface BatchProcessingState {
  items: Map<string, BatchItem>;
  totalCount: number;
  completedCount: number;
  failedCount: number;
}


// ============================================
// Component Props Types
// ============================================

export interface UrlInputProps {
  onUrlSubmit: (url: string) => Promise<void>;
  onError: (error: string) => void;
  disabled?: boolean;
}

export interface DropZoneProps {
  onDrop: (file: File) => void;
  onError: (error: string) => void;
  disabled?: boolean;
  isActive?: boolean;
  children?: React.ReactNode;
}

export interface ImageComparisonProps {
  originalImage: string; // base64 or URL
  processedImage: string; // base64 or URL
  className?: string;
}

export interface BatchProgressProps {
  items: BatchItem[];
  onRetry: (id: string) => void;
  onDownload: (id: string) => void;
  onDownloadAll: () => void;
}


// ============================================
// Landing Page Component Props
// ============================================

export interface HeroSectionProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
}

export interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface FeaturesSectionProps {
  features: Feature[];
}

// ============================================
// Pricing Component Props
// ============================================

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  highlighted?: boolean;
  ctaText: string;
}

export interface PricingCardProps {
  plan: PricingPlan;
  billingPeriod: "monthly" | "annual";
  onSelect: (planId: string) => void;
}

export interface PricingToggleProps {
  value: "monthly" | "annual";
  onChange: (value: "monthly" | "annual") => void;
  savingsPercentage?: number; // Annual savings percentage
}

// ============================================
// File Validation Types
// ============================================

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
] as const;

export type AcceptedImageType = (typeof ACCEPTED_IMAGE_TYPES)[number];
