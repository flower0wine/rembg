"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants/routes";

interface HeroSectionProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
}

export function HeroSection({
  title,
  subtitle,
  ctaText,
  ctaHref,
}: HeroSectionProps) {
  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden bg-linear-to-b from-background to-muted/20 px-4 py-20">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              <span>AI驱动的背景移除工具</span>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 max-w-4xl text-5xl font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl"
          >
            {title}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl"
          >
            {subtitle}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col gap-4 sm:flex-row"
          >
            <Button asChild size="lg" className="group text-base">
              <Link href={ctaHref}>
                {ctaText}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base">
              <Link href={ROUTES.PRICING}>查看定价</Link>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 grid grid-cols-3 gap-8 border-t border-border pt-8"
          >
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-foreground">10万+</div>
              <div className="text-sm text-muted-foreground">处理图片</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-foreground">5秒</div>
              <div className="text-sm text-muted-foreground">平均处理时间</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-foreground">99.9%</div>
              <div className="text-sm text-muted-foreground">准确率</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
