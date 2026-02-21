"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AvatarEvolutionProps {
  children: React.ReactNode;
  trigger?: boolean;
  onComplete?: () => void;
  className?: string;
}

export function AvatarEvolution({
  children,
  trigger = false,
  onComplete,
  className,
}: AvatarEvolutionProps) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (trigger) {
      setActive(true);
      const t = setTimeout(() => {
        setActive(false);
        onComplete?.();
      }, 900);
      return () => clearTimeout(t);
    }
  }, [trigger, onComplete]);

  return (
    <div className={cn("relative inline-block", className)}>
      {active && (
        <div
          className="absolute inset-0 rounded-full bg-[#0FA958]/30 -m-2"
          style={{
            animation: "avatar-aura 900ms ease-out forwards",
          }}
        />
      )}
      <div
        className={cn("relative", active && "animate-[avatar-evolution_900ms_ease-in-out]")}
      >
        {children}
      </div>
    </div>
  );
}
