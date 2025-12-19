/**
 * Hook for getting status icons using lucide-react
 */

"use client";

import type { RemBgImage } from "../store";
import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";

export function useStatusIcon() {
  const getStatusIcon = (status: RemBgImage["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4" />;
      case "processing":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "error":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: RemBgImage["status"]) => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "processing":
        return "text-blue-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-400";
    }
  };

  const getStatusBgColor = (status: RemBgImage["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20";
      case "processing":
        return "bg-blue-500/20";
      case "error":
        return "bg-red-500/20";
      default:
        return "bg-gray-500/20";
    }
  };

  return {
    getStatusIcon,
    getStatusColor,
    getStatusBgColor,
  };
}
