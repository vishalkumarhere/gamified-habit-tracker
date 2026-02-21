"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import type { HabitStats, UserStats, RpgStat } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface HabitBreakdownProps {
  habits: HabitStats[];
  userStats: UserStats;
  rpgStats?: RpgStat[];
}

function userStatsToRadar(stats: UserStats, rpgStats: RpgStat[]) {
  return rpgStats.map((s) => ({
    subject: s.name,
    value: stats[s.id] ?? 0,
    fullMark: 100,
  }));
}

export function HabitBreakdown({ habits, userStats, rpgStats = [] }: HabitBreakdownProps) {
  const radarChartData = userStatsToRadar(userStats, rpgStats);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-2">RPG Stats</h3>
        <div className="h-48 min-h-[192px] w-full">
          <ResponsiveContainer width="100%" height={192}>
            <RadarChart data={radarChartData}>
              <PolarGrid stroke="#1A1A1A" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: "#C7C7C7", fontSize: 11 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: "#8A8A8A", fontSize: 10 }}
              />
              <Radar
                name="Stats"
                dataKey="value"
                stroke="#0FA958"
                fill="#0FA958"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">Habit Success Rates</h3>
        <div className="rounded-lg border border-[#1F1F1F] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-[#1F1F1F] hover:bg-transparent">
                <TableHead className="text-muted-foreground">Habit</TableHead>
                <TableHead className="text-muted-foreground text-right">
                  Success %
                </TableHead>
                <TableHead className="text-muted-foreground text-right">
                  Completions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {habits.map((h) => (
                <TableRow
                  key={h.habitId}
                  className="border-[#1F1F1F] hover:bg-[#0A0A0A]"
                >
                  <TableCell className="font-medium">{h.title}</TableCell>
                  <TableCell className="text-right font-[family-name:var(--font-jetbrains-mono)]">
                    {h.successRate}%
                  </TableCell>
                  <TableCell className="text-right font-[family-name:var(--font-jetbrains-mono)]">
                    {h.totalCompletions}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
