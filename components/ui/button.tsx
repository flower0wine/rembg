import type { VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    // 1. 基础布局与交互
    "inline-flex",
    "items-center",
    "justify-center",
    "gap-2",
    "whitespace-nowrap",
    "rounded-md",
    "text-sm",
    "font-medium",
    "transition-all",
    "shrink-0",
    "outline-none",

    // 2. 禁用状态
    "disabled:pointer-events-none",
    "disabled:opacity-50",

    // 3. 内嵌 SVG 图标通用样式
    "[&_svg]:pointer-events-none",
    "[&_svg:not([class*='size-'])]:size-4",
    "[&_svg]:shrink-0",

    // 4. 焦点可见状态
    "focus-visible:border-ring",
    "focus-visible:ring-ring/50",
    "focus-visible:ring-[3px]",

    // 5. 错误状态（aria-invalid）
    "aria-invalid:ring-destructive/20",
    "dark:aria-invalid:ring-destructive/40",
    "aria-invalid:border-destructive",
  ].join(" "),
  {
    variants: {
      variant: {
        default: cn(
          "bg-primary",
          "text-primary-foreground",
          "hover:bg-primary/90"
        ),

        destructive: cn(
          "bg-destructive",
          "text-white",
          "hover:bg-destructive/90",
          "focus-visible:ring-destructive/20",
          "dark:focus-visible:ring-destructive/40",
          "dark:bg-destructive/60"
        ),

        outline: cn(
          "border",
          "border-input",
          "bg-background",
          "shadow-sm",
          "hover:bg-accent",
          "hover:text-accent-foreground",
          "dark:bg-input/30",
          "dark:border-input",
          "dark:hover:bg-input/50"
        ),

        secondary: cn(
          "bg-secondary",
          "text-secondary-foreground",
          "hover:bg-secondary/80"
        ),

        ghost: cn(
          "hover:bg-accent",
          "hover:text-accent-foreground",
          "dark:hover:bg-accent/50"
        ),

        link: cn(
          "text-primary",
          "underline-offset-4",
          "hover:underline"
        ),
      },

      size: {
        "default": "h-9 px-4 py-2 has-[>svg]:px-3",
        "sm": "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        "lg": "h-10 rounded-md px-6 has-[>svg]:px-4",
        "icon": "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button">
  & VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
