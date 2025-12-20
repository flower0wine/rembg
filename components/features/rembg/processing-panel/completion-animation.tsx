"use client";

import { motion } from "framer-motion";

export function CompletionAnimation() {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <motion.div
        className="absolute inset-0 bg-primary/20"
        initial={{ scale: 0, borderRadius: "50%" }}
        animate={{ scale: 3, borderRadius: "0%" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
    </motion.div>
  );
}
