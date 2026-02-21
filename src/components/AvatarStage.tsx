"use client";

import Image from "next/image";
import { getAvatarImageUrl } from "@/lib/evolution";
import { cn } from "@/lib/utils";

interface AvatarStageProps {
  stage: 1 | 2 | 3 | 4;
  className?: string;
}

export function AvatarStage({ stage, className }: AvatarStageProps) {
  const imageUrl = getAvatarImageUrl(stage);
  const isHeavenly = stage === 4;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-full border-2 border-[#0FA958] w-20 h-20 shrink-0",
        isHeavenly && "ring-2 ring-[#0FA958]/50 shadow-[0_0_20px_rgba(15,169,88,0.3)]",
        className
      )}
    >
      <Image
        src={imageUrl}
        alt={`Avatar stage ${stage}`}
        fill
        className="object-cover"
        sizes="80px"
      />
    </div>
  );
}
