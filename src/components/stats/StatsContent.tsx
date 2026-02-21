"use client";

import { useWeeklyStats } from "@/hooks/useWeeklyStats";
import { AvatarTimeline } from "./AvatarTimeline";
import { WeeklyCharts } from "./WeeklyCharts";
import { HabitBreakdown } from "./HabitBreakdown";
import { StreakHeatmap } from "./StreakHeatmap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StatsContent() {
  const { daily, habits, streakDays, userStats, rpgStats } = useWeeklyStats();

  return (
    <div className="space-y-6">
      <Card className="bg-[#0A0A0A] border-[#1F1F1F]">
        <CardHeader>
          <CardTitle className="text-base">Avatar Evolution Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <AvatarTimeline daily={daily} />
        </CardContent>
      </Card>

      <Card className="bg-[#0A0A0A] border-[#1F1F1F]">
        <CardHeader>
          <CardTitle className="text-base">Weekly Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <WeeklyCharts daily={daily} />
        </CardContent>
      </Card>

      <Card className="bg-[#0A0A0A] border-[#1F1F1F]">
        <CardHeader>
          <CardTitle className="text-base">Habit Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <HabitBreakdown habits={habits} userStats={userStats} rpgStats={rpgStats} />
        </CardContent>
      </Card>

      <Card className="bg-[#0A0A0A] border-[#1F1F1F]">
        <CardHeader>
          <CardTitle className="text-base">Streak History</CardTitle>
        </CardHeader>
        <CardContent>
          <StreakHeatmap streakDays={streakDays} />
        </CardContent>
      </Card>
    </div>
  );
}
