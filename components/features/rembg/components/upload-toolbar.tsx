/**
 * Upload toolbar - URL input only
 */

"use client";

import { motion } from "framer-motion";
import { useAtom } from "jotai";
import { Link as LinkIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useImageActions } from "../hooks";
import { isProcessingAtom } from "../store";

export function UploadToolbar() {
  const [isProcessing] = useAtom(isProcessingAtom);
  const { processImage } = useImageActions();
  const [urlInput, setUrlInput] = useState("");
  const [isSubmittingUrl, setIsSubmittingUrl] = useState(false);

  const handleUrlSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!urlInput.trim()) {
        toast.error("请输入图片 URL");
        return;
      }

      setIsSubmittingUrl(true);
      try {
        URL.parse(urlInput);
        const urlParts = urlInput.split("/");
        const filename = urlParts[urlParts.length - 1] || "image.png";
        processImage(urlInput, filename);
        setUrlInput("");
      } catch {
        toast.error("请输入有效的 URL");
      } finally {
        setIsSubmittingUrl(false);
      }
    },
    [urlInput, processImage]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "rounded-lg border bg-card p-4 transition-colors",
        isProcessing && "opacity-50"
      )}
    >
      {/* URL input row */}
      <form onSubmit={handleUrlSubmit} className="flex gap-2">
        <div className="flex-1">
          <Input
            type="url"
            placeholder="输入图片 URL..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            disabled={isProcessing || isSubmittingUrl}
            className="h-9 text-sm"
          />
        </div>
        <Button
          type="submit"
          disabled={isProcessing || isSubmittingUrl || !urlInput.trim()}
          size="sm"
          variant="outline"
        >
          <LinkIcon className="h-4 w-4" />
          加载
        </Button>
      </form>
    </motion.div>
  );
}
