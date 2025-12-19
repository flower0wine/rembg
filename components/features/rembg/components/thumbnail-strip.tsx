/**
 * Thumbnail strip for image selection with add more button
 */

"use client";

import { motion } from "framer-motion";
import { useAtom } from "jotai";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useImageActions, useImageSelection, useStatusIcon } from "../hooks";
import { imagesAtom, isProcessingAtom, selectedImageIdAtom } from "../store";
import { AddMoreButton } from "./add-more-button";

export function ThumbnailStrip() {
  const [images] = useAtom(imagesAtom);
  const [selectedImageId] = useAtom(selectedImageIdAtom);
  const [isProcessing] = useAtom(isProcessingAtom);
  const { selectImage } = useImageSelection();
  const { processBatch } = useImageActions();
  const { getStatusIcon, getStatusColor, getStatusBgColor } = useStatusIcon();

  if (images.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex gap-2 overflow-x-auto pb-2 mx-auto"
      style={{ maxWidth: "600px" }}
    >
      {images.map(img => (
        <button
          key={img.id}
          onClick={() => selectImage(img.id)}
          className={cn(
            "relative shrink-0 overflow-hidden rounded-lg border-2 transition-all",
            selectedImageId === img.id
              ? "border-primary shadow-lg"
              : "border-gray-300 dark:border-gray-700 opacity-60 hover:opacity-100"
          )}
        >
          {/* Thumbnail image */}
          <motion.div
            className="relative h-16 w-16 bg-muted overflow-hidden"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {img.processedImage
              ? (
                  <Image
                    src={img.processedImage}
                    alt={img.filename}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                )
              : (
                  <Image
                    src={img.originalImage}
                    alt={img.filename}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                )}

            {/* Status overlay */}
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center",
                getStatusBgColor(img.status),
                getStatusColor(img.status)
              )}
            >
              {getStatusIcon(img.status)}
            </div>
          </motion.div>
        </button>
      ))}

      {/* Add more button */}
      <AddMoreButton
        onFilesSelect={processBatch}
        disabled={isProcessing}
      />
    </motion.div>
  );
}
