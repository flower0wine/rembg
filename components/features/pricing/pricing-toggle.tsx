"use client";

import type { PricingToggleProps } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function PricingToggle({
  value,
  onChange,
  savingsPercentage = 20,
}: PricingToggleProps) {
  return (
    <motion.div
      className="flex flex-col items-center gap-3"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Tabs value={value} onValueChange={v => onChange(v as "monthly" | "annual")}>
        <TabsList>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="annual">Annual</TabsTrigger>
        </TabsList>
      </Tabs>
      <AnimatePresence mode="wait">
        {value === "annual" && (
          <motion.p
            className="text-sm text-primary font-medium"
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            Save
            {" "}
            {savingsPercentage}
            % with annual billing
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
