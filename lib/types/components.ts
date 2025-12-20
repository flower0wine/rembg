/**
 * Component props type definitions
 */

import type { BatchItem } from "./batch";

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
