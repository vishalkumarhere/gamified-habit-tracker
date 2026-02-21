"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface MomentumBurstProps {
  amount: number;
  children?: React.ReactNode;
  trigger?: boolean;
  onComplete?: () => void;
  className?: string;
}

const BURST_COUNT = 12;

export function MomentumBurst({
  amount,
  children,
  trigger = false,
  onComplete,
  className,
}: MomentumBurstProps) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (trigger) {
      setActive(true);
      const t = setTimeout(() => {
        setActive(false);
        onComplete?.();
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [trigger, onComplete]);

  if (!active) return <>{children}</>;

  return (
    <div className={cn("relative", className)}>
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible"
        style={{
          width: "140%",
          height: "140%",
          margin: "-20%",
        }}
      >
        <div
          className="absolute w-full h-full rounded-full bg-[#0FA958]/20"
          style={{
            animation: "momentum-burst 1.2s ease-out forwards",
          }}
        />
        <span
          className="absolute font-[family-name:var(--font-jetbrains-mono)] text-sm font-medium text-[#0FA958] animate-in fade-in zoom-in-50 duration-300"
          style={{ animationDuration: "300ms" }}
        >
          +Momentum {amount}
        </span>
      </div>
      {children}
    </div>
  );
}
