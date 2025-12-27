"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { UserMenu } from "@/components/features/auth/user-menu";
import { Button } from "@/components/ui/button";
import { Navbar } from "./navbar";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 防止移动菜单打开时页面滚动
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    }
    else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          <Image
            src="/rembg.png"
            alt="背景移除"
            width={32}
            height={32}
            className="h-7 w-7 sm:h-8 sm:w-8"
          />
          <span className="text-lg font-bold sm:text-xl">背景移除</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 md:flex lg:gap-8">
          <Navbar />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:block">
            <UserMenu />
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="切换菜单"
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileMenuOpen
                ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.1 }}
                    >
                      <X className="h-5 w-5" />
                    </motion.div>
                  )
                : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.1 }}
                    >
                      <Menu className="h-5 w-5" />
                    </motion.div>
                  )}
            </AnimatePresence>
          </Button>
        </div>
      </div>

      {/* Mobile Menu - 使用绝对定位避免挤开页面 */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* 背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 top-14 z-40 bg-background/80 backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* 菜单内容 */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1]
              }}
              className="absolute left-0 right-0 top-full z-50 border-t border-border/40 bg-background/98 shadow-lg backdrop-blur-sm md:hidden"
            >
              <div className="flex flex-col space-y-1 px-4 py-4">
                <Navbar mobile onNavigate={() => setMobileMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="border-t border-border pt-4 mt-2"
                >
                  <UserMenu mobile />
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
