"use client";

import { motion } from "framer-motion";
import { CheckCircle, Download, Upload, Wand2 } from "lucide-react";

interface Step {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: 1,
    icon: <Upload className="h-8 w-8" />,
    title: "上传图片",
    description: "选择本地文件、输入URL或直接拖拽图片到上传区域",
  },
  {
    number: 2,
    icon: <Wand2 className="h-8 w-8" />,
    title: "AI处理",
    description: "我们的AI算法自动识别并移除图片背景，仅需几秒钟",
  },
  {
    number: 3,
    icon: <CheckCircle className="h-8 w-8" />,
    title: "预览对比",
    description: "使用滑块对比原图和处理后的效果，确保满意",
  },
  {
    number: 4,
    icon: <Download className="h-8 w-8" />,
    title: "下载保存",
    description: "下载透明背景的PNG图片，支持单张或批量下载",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export function HowItWorks() {
  return (
    <section className="bg-muted/30 px-4 py-20">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            如何使用
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            简单四步，轻松移除图片背景
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative"
        >
          {/* Connection Line */}
          <div className="absolute left-8 top-0 hidden h-full w-0.5 bg-linear-to-b from-primary via-primary/50 to-transparent md:block" />

          <div className="space-y-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                variants={itemVariants}
                className="relative flex flex-col gap-6 md:flex-row md:items-center"
              >
                {/* Step Number Circle */}
                <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 border-background bg-primary text-2xl font-bold text-primary-foreground shadow-lg">
                  {step.number}
                </div>

                {/* Step Content */}
                <div className="flex-1 rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
                  <div className="mb-3 inline-flex rounded-lg bg-primary/10 p-2 text-primary">
                    {step.icon}
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-card-foreground">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
