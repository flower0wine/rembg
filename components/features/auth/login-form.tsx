"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useAuthContext } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/lib/constants/routes";
import { getSubscriptionStatus } from "@/lib/request/api/subscription";

const loginSchema = z.object({
  email: z.email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少需要6个字符"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { signIn, signInWithOAuth } = useAuthContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || ROUTES.APP;
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    const { error } = await signIn(data.email, data.password);

    if (error) {
      toast.error("登录失败", {
        description: error.message || "请检查您的邮箱和密码",
      });
      setIsLoading(false);
    }
    else {
      // 登录成功后获取订阅信息和token
      try {
        await getSubscriptionStatus();
        router.push(redirectTo);
      }
      catch (err) {
        console.error("Failed to fetch subscription:", err);
        router.push(redirectTo);
      }
    }
  };

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    setIsLoading(true);

    const { error } = await signInWithOAuth(provider);

    if (error) {
      toast.error("登录失败", {
        description: error.message || "无法连接到认证服务",
      });
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>登录</CardTitle>
        <CardDescription>
          登录您的账户以访问完整功能
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              disabled={isLoading}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              disabled={isLoading}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "登录中..." : "登录"}
          </Button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              或使用
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={async () => handleOAuthSignIn("google")}
            className="flex items-center gap-2"
          >
            <Image
              src="/google.svg"
              alt="Google"
              width={16}
              height={16}
            />
            Google
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={async () => handleOAuthSignIn("github")}
            className="flex items-center gap-2"
          >
            <Image
              src="/github.svg"
              alt="GitHub"
              width={20}
              height={20}
            />
            GitHub
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          <span>还没有账户？</span>
          <a href={ROUTES.REGISTER} className="text-primary hover:underline">
            注册
          </a>
        </p>
      </CardFooter>
    </Card>
  );
}
