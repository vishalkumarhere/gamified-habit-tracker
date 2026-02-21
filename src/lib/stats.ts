import type { Habit, Category, UserStats, CompletionRecord, RpgStat } from "./types";
import { UNCATEGORIZED_ID } from "./storage";

const BASE_STAT = 20;
const STAT_SCALE = 2;
const STAT_CAP = 100;
const DAYS_TO_CONSIDER = 14;

export function computeUserStatsFromHabits(
  habits: Habit[],
  categories: Category[],
  completions: CompletionRecord[],
  rpgStats: RpgStat[],
  statsResetDate?: string | null
): UserStats {
  const today = new Date();
  const effectiveCompletions = statsResetDate
    ? completions.filter((c) => c.date > statsResetDate)
    : completions;

  const categoryToStatId = new Map<string, string>();
  categories.forEach((c) => {
    const id = c.statId ?? (c.statKey && rpgStats.some((s) => s.id === c.statKey) ? c.statKey : undefined) ?? (c.id === UNCATEGORIZED_ID && rpgStats[0] ? rpgStats[0].id : undefined);
    if (id) categoryToStatId.set(c.id, id);
  });

  const statContributions: Record<string, number> = {};
  rpgStats.forEach((s) => (statContributions[s.id] = 0));

  for (let d = 0; d < DAYS_TO_CONSIDER; d++) {
    const date = new Date(today);
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().slice(0, 10);

    habits.forEach((habit) => {
      if (habit.type !== "good") return;
      const statId = categoryToStatId.get(habit.categoryId);
      if (!statId) return;

      const rec = effectiveCompletions.find(
        (c) => c.date === dateStr && c.habitId === habit.id
      );
      const reps = rec?.repetitions ?? 0;
      const contribution = Math.min(reps, habit.targetReps);
      statContributions[statId] = (statContributions[statId] ?? 0) + contribution;
    });
  }

  const result: UserStats = {};
  rpgStats.forEach((s) => {
    result[s.id] = Math.min(
      STAT_CAP,
      Math.round(BASE_STAT + (statContributions[s.id] ?? 0) * STAT_SCALE)
    );
  });
  return result;
}
