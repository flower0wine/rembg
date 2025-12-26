"use client";

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
import { setToken } from "@/lib/utils/browser";

export function UserMenu() {
  const router = useRouter();
  const { user, isInitAuth, signOut } = useAuthContext();

  if (!isInitAuth) {
    return (
      <Button variant="ghost" className="relative h-10 w-10 rounded-full" disabled>
        <Avatar className="h-10 w-10 animate-pulse">
          <AvatarFallback className="bg-muted" />
        </Avatar>
      </Button>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" asChild>
          <Link href={ROUTES.LOGIN}>登录</Link>
        </Button>
        <Button asChild>
          <Link href={ROUTES.REGISTER}>注册</Link>
        </Button>
      </div>
    );
  }

  const handleSignOut = async () => {
    const { error } = await signOut();

    if (error) {
      toast.error("退出失败", {
        description: error.message || "请稍后重试",
      });
    }
    else {
      // 清除token
      setToken();
      router.push(ROUTES.LOGIN);
    }
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const avatarUrl = user.user_metadata?.avatar_url;

  return (
    <DropdownMenu>
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
