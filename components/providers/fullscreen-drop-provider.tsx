"use client";

/**
 * 全屏拖拽上传 Provider
 * 在应用的任何地方提供全屏拖拽上传功能
 */

import type { ReactNode } from "react";
import { createContext, useContext } from "react";

export interface FullscreenDropError {
  type: "size" | "type" | "unknown";
  message: string;
}

interface FullscreenDropContextValue {
  onFilesSelected?: (files: File[]) => void;
  onError?: (error: FullscreenDropError) => void;
  disabled?: boolean;
}

const FullscreenDropContext = createContext<FullscreenDropContextValue>({});

export function useFullscreenDrop() {
  return useContext(FullscreenDropContext);
}

interface FullscreenDropProviderProps {
  children: ReactNode;
  value?: FullscreenDropContextValue;
}

export function FullscreenDropProvider({
  children,
  value = {},
}: FullscreenDropProviderProps) {
  return (
    <FullscreenDropContext.Provider value={value}>
      {children}
    </FullscreenDropContext.Provider>
  );
}
