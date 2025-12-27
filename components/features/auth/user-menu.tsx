"use client";

import { AnimatePresence, motion } from "framer-motion";
import { History, LogOut, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthContext } from "@/components/providers/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/lib/constants/routes";

interface UserMenuProps {
  mobile?: boolean;
}

// 容器动画配置 - 使用 staggerChildren 实现子元素依次出现
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.04,
      staggerDirection: -1,
    },
  },
};

// 用户信息卡片动画
const userCardVariants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: -10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -5,
    transition: { duration: 0.2 },
  },
};

// 菜单项动画
const menuItemVariants = {
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
    transition: { duration: 0.2 },
  },
};

export function UserMenu({ mobile = false }: UserMenuProps) {
  const router = useRouter();
  const { user, isInitAuth, signOut } = useAuthContext();

  const handleSignOut = async () => {
    const { error } = await signOut();

    if (error) {
      toast.error("退出失败", {
        description: error.message || "请稍后重试",
      });
    }
    else {
      router.push(ROUTES.LOGIN);
    }
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  if (!isInitAuth) {
    return (
      <Button variant="ghost" className="relative h-10 w-10 rounded-full" disabled>
        <Avatar className="h-10 w-10 animate-pulse">
          <AvatarFallback className="bg-muted" />
        </Avatar>
      </Button>
    );
  }

  const avatarUrl = user?.user_metadata?.avatar_url;
  const menuItems = [
    { href: ROUTES.APP, icon: User, label: "背景移除" },
    { href: ROUTES.HISTORY, icon: History, label: "处理历史" },
  ];

  if (!user) {
    return (
      <motion.div
        key="desktop-auth-buttons"
        className="flex items-center gap-2"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <Button variant="ghost" asChild>
          <Link href={ROUTES.LOGIN}>登录</Link>
        </Button>
        <Button asChild>
          <Link href={ROUTES.REGISTER}>注册</Link>
        </Button>
      </motion.div>
    );
  }

  if (mobile) {
    return (
      <motion.div
        key="mobile-user-menu"
        className="flex flex-col space-y-2"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.div
          variants={userCardVariants}
          className="flex items-center gap-3 rounded-md bg-muted/50 px-3 py-2.5"
        >
          <Avatar className="h-10 w-10">
            {avatarUrl && (
              <AvatarImage src={avatarUrl} alt="用户头像" />
            )}
            <AvatarFallback>{getInitials(user.email || "U")}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-sm font-medium">我的账户</p>
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
              {user.email}
            </p>
          </div>
        </motion.div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.href}
              variants={menuItemVariants}
            >
              <Link
                href={item.href}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            </motion.div>
          );
        })}

        <motion.button
          variants={menuItemVariants}
          onClick={handleSignOut}
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          <span>退出登录</span>
        </motion.button>
      </motion.div>
    );
  }

  return (
    <DropdownMenu key="desktop-user-menu">
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            {avatarUrl && (
              <AvatarImage src={avatarUrl} alt="用户头像" />
            )}
            <AvatarFallback>{getInitials(user.email || "U")}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">我的账户</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={ROUTES.APP} className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>背景移除</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={ROUTES.HISTORY} className="cursor-pointer">
            <History className="mr-2 h-4 w-4" />
            <span>处理历史</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>退出登录</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
