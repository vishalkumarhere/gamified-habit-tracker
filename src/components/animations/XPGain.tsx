"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface XPGainProps {
  amount: number;
  variant?: "gain" | "penalty";
  onComplete?: () => void;
  className?: string;
}

export function XPGain({
  amount,
  variant = "gain",
  onComplete,
  className,
}: XPGainProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 600);
    return () => clearTimeout(t);
  }, [onComplete]);

  if (!visible) return null;

  const prefix = variant === "gain" ? "+" : "";
  const colorClass =
    variant === "gain"
      ? "text-[#0FA958] drop-shadow-[0_0_8px_rgba(15,169,88,0.6)]"
      : "text-destructive drop-shadow-[0_0_8px_rgba(176,0,32,0.6)]";

  return (
    <span
      className={cn(
        "absolute inset-0 flex items-center justify-center pointer-events-none z-20 font-[family-name:var(--font-jetbrains-mono)] font-bold text-xl",
        colorClass
      )}
      style={{
        animation: "xp-gain-float 600ms ease-out forwards",
      }}
    >
      {prefix}
      {amount} XP
    </span>
  );
}
