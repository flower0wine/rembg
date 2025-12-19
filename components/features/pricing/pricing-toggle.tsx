"use client";

import type { PricingToggleProps } from "@/lib/types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function PricingToggle({
  value,
  onChange,
  savingsPercentage = 20,
}: PricingToggleProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <Tabs value={value} onValueChange={v => onChange(v as "monthly" | "annual")}>
        <TabsList>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="annual">Annual</TabsTrigger>
        </TabsList>
      </Tabs>
      {value === "annual" && (
        <p className="text-sm text-primary font-medium">
          Save
          {" "}
          {savingsPercentage}
          % with annual billing
        </p>
      )}
    </div>
  );
}
