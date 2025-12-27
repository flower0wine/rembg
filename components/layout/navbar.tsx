"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn.util";

const navItems = [
  { href: ROUTES.APP, label: "移除背景" },
  { href: ROUTES.PRICING, label: "定价" },
];

interface NavbarProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

// 容器动画配置 - 使用 staggerChildren 实现子元素依次出现
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08, // 每个子元素延迟 80ms
      delayChildren: 0.05, // 第一个子元素延迟 50ms
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1, // 反向退出
    },
  },
};

// 子元素动画配置
const itemVariants = {
  hidden: {
    opacity: 0,
    x: -20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
  exit: {
    opacity: 0,
    x: -10,
    scale: 0.95,
    transition: {
      duration: 0.2,
    },
  },
};

export function Navbar({ mobile = false, onNavigate }: NavbarProps) {
  const pathname = usePathname();

  if (mobile) {
    return (
      <motion.nav
        key="mobile-nav"
        className="flex flex-col space-y-1"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <motion.div
              key={item.href}
              variants={itemVariants}
            >
              <Link
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "block rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            </motion.div>
          );
        })}
      </motion.nav>
    );
  }

  return (
    <motion.nav
      key="desktop-nav"
      className="flex items-center gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              isActive
                ? "text-foreground"
                : "text-muted-foreground"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </motion.nav>
  );
}
