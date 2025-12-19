import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // 1. 基础布局与外观
        "h-9",
        "w-full",
        "min-w-0",
        "rounded-md",
        "border",
        "border-input",
        "bg-transparent",
        "dark:bg-input/30",
        "px-3",
        "py-1",
        "shadow-sm",

        // 2. 文字与占位符
        "text-base",
        "md:text-sm",
        "placeholder:text-muted-foreground",

        // 3. 选中状态
        "selection:bg-primary",
        "selection:text-primary-foreground",

        // 4. 文件上传按钮（<input type="file">）样式
        "file:inline-flex",
        "file:h-7",
        "file:border-0",
        "file:bg-transparent",
        "file:text-sm",
        "file:font-medium",
        "file:text-foreground",

        // 5. 交互与过渡
        "outline-none",
        "transition-[color,box-shadow]",

        // 6. 禁用状态
        "disabled:pointer-events-none",
        "disabled:cursor-not-allowed",
        "disabled:opacity-50",

        // 7. 焦点可见状态（focus-visible）
        "focus-visible:ring-ring",
        "focus-visible:ring-1",
        "focus-visible:outline-none",

        // 8. 错误状态（aria-invalid）
        "aria-invalid:border-destructive",
        "aria-invalid:ring-destructive/20",
        "dark:aria-invalid:ring-destructive/40",

        // 9. 用户自定义样式（最后放入，确保可覆盖）
        className
      )}
      {...props}
    />
  );
}

export { Input };