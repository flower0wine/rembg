"use client";

import { Mail, RefreshCw } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { useAuthContext } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [isResending, setIsResending] = useState(false);
  const { resend } = useAuthContext();

  const handleResendEmail = async () => {
    if (!email) {
      toast.error("无法重新发送", {
        description: "未找到邮箱地址",
      });
      return;
    }

    setIsResending(true);

    try {
      const { error } = await resend({
        type: "signup",
        email,
      });

      if (error) {
        throw error;
      }

      toast.success("邮件已重新发送", {
        description: "请检查您的收件箱",
      });
    }
    catch (error) {
      console.error(error);
      toast.error("发送失败", {
        description: "请稍后再试",
      });
    }
    finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">验证您的邮箱</CardTitle>
        <CardDescription className="text-base">
          我们已向
          {email && (
            <span className="block mt-1 font-medium text-foreground">
              {email}
            </span>
          )}
          发送了验证链接
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-sm text-muted-foreground">
          <p className="flex items-start gap-2">
            <span className="text-primary font-medium">1.</span>
            <span>打开您的邮箱收件箱</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-primary font-medium">2.</span>
            <span>查找来自我们的验证邮件</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-primary font-medium">3.</span>
            <span>点击邮件中的验证链接</span>
          </p>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>没有收到邮件？</p>
          <p className="mt-1">请检查垃圾邮件文件夹</p>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleResendEmail}
          disabled={isResending || !email}
        >
          <RefreshCw className={`h-4 w-4 ${isResending ? "animate-spin" : ""}`} />
          {isResending ? "发送中..." : "重新发送验证邮件"}
        </Button>
      </CardContent>

    </Card>
  );
}
