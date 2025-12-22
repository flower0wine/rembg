import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckoutActions } from "./checkout-actions";
import { CheckoutVerification } from "./checkout-verification";

interface CheckoutSuccessPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export function CheckoutSuccessPage({ searchParams }: CheckoutSuccessPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="text-center shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold">
              订阅处理中
            </CardTitle>
            <CardDescription>
              我们正在验证您的订阅状态...
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Suspense fallback={<div>加载中...</div>}>
              <CheckoutVerification />
            </Suspense>

            <CheckoutActions />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}