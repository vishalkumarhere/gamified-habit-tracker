"use client";

import { cn } from "@/lib/utils";

interface XPBarProps {
  value: number; // 0-100
  className?: string;
}

export function XPBar({ value, className }: XPBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      className={cn(
        "w-full h-2 rounded-full bg-[#1A1A1A] overflow-hidden",
        className
      )}
    >
      <div
        className={cn(
          "h-full rounded-full bg-gradient-to-r from-[#0FA958] to-emerald-700 transition-all duration-500",
          clamped >= 100 && "animate-pulse"
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
