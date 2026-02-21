"use client";

import Image from "next/image";
import type { DailySummary } from "@/lib/types";
import { AVATAR_IMAGES } from "@/lib/evolution";
import { cn } from "@/lib/utils";

interface AvatarTimelineProps {
  daily: DailySummary[];
}

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function AvatarTimeline({ daily }: AvatarTimelineProps) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-4 min-w-max">
        {daily.map((d) => {
          const date = new Date(d.date);
          const dayName = dayNames[date.getDay()];
          const imageUrl = AVATAR_IMAGES[d.avatarStage];

          return (
            <div
              key={d.date}
              className="flex flex-col items-center gap-2 shrink-0 w-24"
            >
              <span className="text-xs text-muted-foreground">{dayName}</span>
              <div className="relative w-14 h-14 rounded-full overflow-hidden border border-[#0FA958]">
                <Image
                  src={imageUrl}
                  alt={`Day ${d.date}`}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>
              <span className="text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#0FA958]">
                {d.completion}%
              </span>
              <span className="text-xs text-muted-foreground">+{d.xp} XP</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
