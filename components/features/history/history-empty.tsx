"use client";

import { motion } from "framer-motion";
import { ArrowRight, FileImage } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants/routes";

export function HistoryEmpty() {
  return (
    <motion.div
      className="text-center py-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      >
        <FileImage className="h-12 w-12 text-muted-foreground" />
      </motion.div>

      <motion.div
        className="space-y-4 flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-xl font-semibold">还没有处理记录</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          您还没有处理过任何图片。开始上传图片并移除背景，您的处理历史将会显示在这里。
        </p>

        <motion.div
          className="pt-4"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button asChild className="gap-2">
            <Link href={ROUTES.APP}>
              试试移除背景
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}