"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants/routes";

export function CheckoutActions() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleNavigation = async (path: string) => {
    setIsNavigating(true);
    router.push(path);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="space-y-3"
    >
      <Button
        onClick={async () => handleNavigation(ROUTES.APP)}
        className="w-full"
        size="lg"
        disabled={isNavigating}
      >
        开始使用
        <ArrowRight className="ml-2 w-4 h-4" />
      </Button>

      <Button
        onClick={async () => handleNavigation("/pricing")}
        variant="outline"
        className="w-full"
        disabled={isNavigating}
      >
        查看订阅详情
      </Button>
    </motion.div>
  );
}