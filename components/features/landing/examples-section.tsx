"use client";

import { motion } from "framer-motion";
import { ImageViewer } from "@/components/ui/image-viewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const imageDomain = process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN!;

if (!imageDomain) {
  throw new Error("NEXT_PUBLIC_R2_PUBLIC_DOMAIN environment variable is missing");
}

const exampleCategories = [
  {
    label: "产品",
    beforeImage: "/cut/mkt.jpg",
    afterImage: "/no_bg/mkt.png",
  },
  {
    label: "人像",
    beforeImage: "/cut/women.jpg",
    afterImage: "/no_bg/women.png",
  },
  {
    label: "Labubu",
    beforeImage: "/cut/labubu.jpg",
    afterImage: "/no_bg/labubu.png",
  },
  {
    label: "汽车",
    beforeImage: "/cut/car.jpg",
    afterImage: "/no_bg/car.png",
  },
  {
    label: "动物",
    beforeImage: "/cut/ear.jpg",
    afterImage: "/no_bg/ear.png",
  },
  {
    label: "Logo",
    beforeImage: "/cut/logo.jpg",
    afterImage: "/no_bg/logo.png",
  }
];

export function ExamplesSection() {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            效果展示
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            查看不同类型图片的背景移除效果，我们的 AI 能够精准识别主体，保持边缘自然流畅
          </p>
        </motion.div>

        {/* 使用增强的 Tabs 组件 */}
        <Tabs defaultValue="0" className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex justify-center mb-8"
          >
            <TabsList className="h-auto p-1">
              {exampleCategories.map((category, index) => (
                <TabsTrigger
                  key={index}
                  value={String(index)}
                  className="px-6 py-2"
                >
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </motion.div>

          {exampleCategories.map((category, index) => (
            <TabsContent key={index} value={String(index)}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 35,
                }}
                className={cn(
                  "rounded-xl overflow-hidden bg-background shadow-lg",
                  "border-2 border-input"
                )}
              >
                <div className="border">
                  <ImageViewer
                    defaultDimensions={{ width: 16, height: 9 }}
                    imageOne={`${imageDomain}${category.afterImage}`}
                    imageTwo={`${imageDomain}${category.beforeImage}`}
                    imageOneAlt={`${category.label} - 原图`}
                    imageTwoAlt={`${category.label} - 移除背景后`}
                    showCheckeredBackground
                  />
                </div>
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
