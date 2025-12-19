/**
 * Processing timer component - isolated to prevent parent re-renders
 */

"use client";

import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface ProcessingTimerProps {
  estimatedTime?: number;
}

export function ProcessingTimer({ estimatedTime = 45 }: ProcessingTimerProps) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const remainingTime = Math.max(0, estimatedTime - elapsedTime);

  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}秒`;
    }
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}分${secs}秒`;
  };

  return (
    <div className="flex items-center gap-2 text-xs text-white/80">
      <Clock className="h-3 w-3" />
      <span>
        预计剩余
        {formatTime(remainingTime)}
      </span>
    </div>
  );
}
