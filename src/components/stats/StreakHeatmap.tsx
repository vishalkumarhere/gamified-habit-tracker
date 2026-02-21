"use client";

import { useMemo } from "react";

interface StreakHeatmapProps {
  streakDays: string[];
}

export function StreakHeatmap({ streakDays }: StreakHeatmapProps) {
  const completedSet = useMemo(
    () => new Set(streakDays),
    [streakDays]
  );

  const { grid } = useMemo(() => {
    const today = new Date();
    const weeksCount = 12;
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - weeksCount * 7);
    startDate.setHours(0, 0, 0, 0);

    const grid: string[][] = [];
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      const row: string[] = [];
      for (let w = 0; w < weeksCount; w++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + w * 7 + dayOfWeek);
        const dateStr = d.toISOString().slice(0, 10);
        row.push(dateStr);
      }
      grid.push(row);
    }
    return { grid };
  }, []);

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1">
        {grid.map((row, ri) => (
          <div key={ri} className="flex flex-col gap-1">
            {row.map((dateStr, ci) => {
              const completed = completedSet.has(dateStr);
              return (
                <div
                  key={ci}
                  className={`w-3 h-3 rounded-sm ${
                    completed ? "bg-[#0FA958]" : "bg-[#1A1A1A]"
                  }`}
                  title={dateStr}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
