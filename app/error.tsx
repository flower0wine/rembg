"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 将错误记录到 Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold">错误</h1>
        <h2 className="mb-4 text-2xl font-semibold">出现了一些问题</h2>
        <p className="mb-8 text-muted-foreground">
          抱歉，应用加载错误，请刷新重试。
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={reset}>重试</Button>
          <Button variant="outline" onClick={() => window.location.href = "/"}>
            返回首页
          </Button>
        </div>
      </div>
    </div>
  );
}
