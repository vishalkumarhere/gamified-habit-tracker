"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface StreakFlashProps {
  children: React.ReactNode;
  trigger?: boolean;
  onComplete?: () => void;
  className?: string;
}

export function StreakFlash({
  children,
  trigger = false,
  onComplete,
  className,
}: StreakFlashProps) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (trigger) {
      setActive(true);
      const t = setTimeout(() => {
        setActive(false);
        onComplete?.();
      }, 500);
      return () => clearTimeout(t);
    }
  }, [trigger, onComplete]);

  return (
    <span
      className={cn(
        "inline-block rounded px-1 transition-shadow",
        active && "animate-[streak-flash_500ms_ease-in-out]",
        className
      )}
      style={
        active
          ? {
              animation: "streak-flash 500ms ease-in-out",
            }
          : undefined
      }
    >
      {children}
    </span>
  );
}
