"use client";

import Image from "next/image";
import Link from "next/link";
import { UserMenu } from "@/components/features/auth/user-menu";
import { Navbar } from "./navbar";

export function Header() {
  return (
    <header className="flex justify-center sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/rembg.png"
              alt="背景移除"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="text-xl font-bold">背景移除</span>
          </Link>
          <Navbar />
        </div>
        <UserMenu />
      </div>
    </header>
  );
}
