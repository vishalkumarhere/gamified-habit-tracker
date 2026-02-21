"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { DailySummary } from "@/lib/types";

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface WeeklyChartsProps {
  daily: DailySummary[];
}

export function WeeklyCharts({ daily }: WeeklyChartsProps) {
  const chartData = daily.map((d) => {
    const date = new Date(d.date);
    return {
      day: dayNames[date.getDay()],
      completion: d.completion,
      xp: d.xp,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-2">Completion %</h3>
        <div className="h-40 min-h-[160px] w-full">
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" />
              <XAxis
                dataKey="day"
                stroke="#8A8A8A"
                tick={{ fill: "#C7C7C7", fontSize: 11 }}
              />
              <YAxis
                domain={[0, 100]}
                stroke="#8A8A8A"
                tick={{ fill: "#C7C7C7", fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0A0A0A",
                  border: "1px solid #1F1F1F",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#C7C7C7" }}
              />
              <Line
                type="monotone"
                dataKey="completion"
                stroke="#0FA958"
                strokeWidth={2}
                dot={{ fill: "#0FA958", r: 4 }}
                activeDot={{ r: 6, fill: "#0FA958" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">XP Gained</h3>
        <div className="h-40 min-h-[160px] w-full">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" />
              <XAxis
                dataKey="day"
                stroke="#8A8A8A"
                tick={{ fill: "#C7C7C7", fontSize: 11 }}
              />
              <YAxis
                stroke="#8A8A8A"
                tick={{ fill: "#C7C7C7", fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0A0A0A",
                  border: "1px solid #1F1F1F",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="xp" fill="#0FA958" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
