"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface StatPulseProps {
  value: number | string;
  variant?: "gain" | "penalty";
  trigger?: number;
  className?: string;
}

export function StatPulse({
  value,
  variant = "gain",
  trigger = 0,
  className,
}: StatPulseProps) {
  const [pulsing, setPulsing] = useState(false);

  useEffect(() => {
    if (trigger > 0) {
      setPulsing(true);
      const t = setTimeout(() => setPulsing(false), 400);
      return () => clearTimeout(t);
    }
  }, [trigger]);

  const colorClass =
    variant === "gain"
      ? "text-[#0FA958]"
      : "text-destructive";

  return (
    <span
      className={cn(
        "inline-block font-[family-name:var(--font-jetbrains-mono)]",
        pulsing && colorClass,
        className
      )}
      style={
        pulsing
          ? {
              animation: "stat-pulse 400ms ease-in-out",
            }
          : undefined
      }
    >
      {value}
    </span>
  );
}
