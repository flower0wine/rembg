import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border/40 bg-background">
      <div className="container mx-auto max-w-7xl px-20 py-8 md:px-6 md:py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 md:gap-6 lg:gap-8">
          {/* Brand Section */}
          <div className="space-y-3 text-center sm:text-left">
            <h3 className="text-lg font-semibold">背景移除</h3>
            <p className="text-sm text-muted-foreground">
              使用AI技术快速移除图片背景，支持单张和批量处理
            </p>
          </div>

          {/* Product Links */}
          <div className="space-y-3 text-center sm:text-left">
            <h4 className="text-sm font-semibold">产品</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={ROUTES.APP}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  背景移除
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.PRICING}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  定价方案
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.HISTORY}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  处理历史
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div className="space-y-3 text-center sm:text-left">
            <h4 className="text-sm font-semibold">资源</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  使用指南
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  API文档
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  常见问题
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-3 text-center sm:text-left">
            <h4 className="text-sm font-semibold">法律</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  隐私政策
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  服务条款
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  联系我们
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-border/40 pt-8 md:mt-12">
          <p className="text-center text-sm text-muted-foreground">
            ©
            {" "}
            {currentYear}
            {" "}
            背景移除工具. 保留所有权利.
          </p>
        </div>
      </div>
    </footer>
  );
}
