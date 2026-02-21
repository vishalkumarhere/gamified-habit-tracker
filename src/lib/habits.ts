import type { Habit, HabitStats, DailySummary, CompletionRecord } from "./types";
import { getAvatarStage } from "./evolution";
import { calculateDailyXP } from "./xp";

export function computeDailyCompletion(habits: Habit[]): number {
  const goodHabits = habits.filter((h) => h.type === "good");
  if (goodHabits.length === 0) return 0;
  const total = goodHabits.reduce(
    (sum, h) => sum + (h.completed ? 100 : h.progress),
    0
  );
  return Math.round(total / goodHabits.length);
}

export function getHabitStats(
  habits: Habit[],
  completions: CompletionRecord[],
  daysCount: number = 7
): HabitStats[] {
  return habits.map((habit) => {
    const habitCompletions = completions.filter(
      (c) => c.habitId === habit.id && c.completed
    );
    const totalCompletions = habitCompletions.length;
    const successRate =
      daysCount > 0 ? Math.round((totalCompletions / daysCount) * 100) : 0;

    return {
      habitId: habit.id,
      title: habit.title,
      successRate: Math.min(successRate, 100),
      totalCompletions,
    };
  });
}

export function getGoodHabitStreakDays(
  goodHabitIds: string[],
  completions: CompletionRecord[]
): string[] {
  if (goodHabitIds.length === 0) return [];
  const byDate = new Map<string, Set<string>>();
  completions.forEach((c) => {
    if (!c.completed) return;
    if (!byDate.has(c.date)) byDate.set(c.date, new Set());
    byDate.get(c.date)!.add(c.habitId);
  });
  return [...byDate.entries()]
    .filter(([, ids]) => {
      return goodHabitIds.every((id) => ids.has(id));
    })
    .map(([date]) => date);
}

export function calculateStreak(streakDays: string[]): number {
  if (streakDays.length === 0) return 0;
  const sorted = [...streakDays].sort();
  const today = new Date().toISOString().slice(0, 10);
  let streak = 0;
  let checkDate = new Date(today);

  for (let i = 0; i < 365; i++) {
    const dateStr = checkDate.toISOString().slice(0, 10);
    if (sorted.includes(dateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export function getWeeklySummaries(
  habitsByDate: Record<string, Habit[]>,
  lastNDays: number = 7
): DailySummary[] {
  const summaries: DailySummary[] = [];
  const today = new Date();

  for (let i = lastNDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const habits = habitsByDate[dateStr] ?? [];

    const completion = computeDailyCompletion(habits);
    const xp = calculateDailyXP(habits, 0);
    const avatarStage = getAvatarStage(completion);

    summaries.push({ date: dateStr, completion, xp, avatarStage });
  }

  return summaries;
}
