"use client";

import { motion } from "framer-motion";
import { Clock, Download, Layers, Shield, Upload, Zap } from "lucide-react";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface FeaturesSectionProps {
  features: Feature[];
}

const defaultFeatures: Feature[] = [
  {
    icon: <Upload className="h-8 w-8" />,
    title: "多种上传方式",
    description: "支持本地文件上传、URL输入和拖拽上传，灵活便捷",
  },
  {
    icon: <Zap className="h-8 w-8" />,
    title: "极速处理",
    description: "AI驱动的背景移除技术，平均5秒完成处理",
  },
  {
    icon: <Layers className="h-8 w-8" />,
    title: "批量处理",
    description: "一次上传多张图片，批量移除背景，提高工作效率",
  },
  {
    icon: <Download className="h-8 w-8" />,
    title: "高质量输出",
    description: "保留透明背景的PNG格式，支持单张或批量下载",
  },
  {
    icon: <Shield className="h-8 w-8" />,
    title: "安全可靠",
    description: "数据加密传输，处理完成后自动删除，保护隐私",
  },
  {
    icon: <Clock className="h-8 w-8" />,
    title: "处理历史",
    description: "登录用户可查看历史记录，随时重新下载处理结果",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export function FeaturesSection({ features = defaultFeatures }: FeaturesSectionProps) {
  return (
    <section className="bg-background px-4 py-20">
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
            强大的功能特性
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            专业的背景移除工具，为您提供高效、便捷的图片处理体验
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative rounded-lg border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
            >
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                {feature.icon}
              </div>
              <h3 className="mb-2 text-xl font-semibold text-card-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
