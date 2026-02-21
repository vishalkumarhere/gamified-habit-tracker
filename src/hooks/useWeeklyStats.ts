"use client";

import { useState, useEffect } from "react";
import type { WeeklyStats, Habit, Category, CompletionRecord } from "@/lib/types";
import {
  loadHabits,
  loadCompletions,
  loadCategories,
  loadRpgStats,
  loadStatsResetDate,
} from "@/lib/storage";
import {
  loadHabits as loadHabitsSupabase,
  loadCompletions as loadCompletionsSupabase,
  loadCategories as loadCategoriesSupabase,
  loadRpgStats as loadRpgStatsSupabase,
  loadStatsResetDate as loadStatsResetDateSupabase,
  loadUserData,
} from "@/lib/storage-supabase";
import { getWeeklySummaries, getHabitStats, getGoodHabitStreakDays } from "@/lib/habits";
import { computeUserStatsFromHabits } from "@/lib/stats";
import type { UserStats, RpgStat } from "@/lib/types";
import { useUser, useSupabaseEnabled } from "@/hooks/useUser";

function loadXpByDate(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem("assassin-xp-by-date");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function useWeeklyStats(): WeeklyStats & {
  userStats: UserStats;
  rpgStats: RpgStat[];
  loading: boolean;
} {
  const { user } = useUser();
  const useSupabase = useSupabaseEnabled() && !!user;
  const userId = user?.id ?? "";

  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<CompletionRecord[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [rpgStats, setRpgStats] = useState<RpgStat[]>([]);
  const [xpByDate, setXpByDate] = useState<Record<string, number>>({});
  const [statsResetDate, setStatsResetDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (useSupabase && userId) {
        const [loadedHabits, loadedCompletions, loadedCategories, loadedRpgStats, userData] =
          await Promise.all([
            loadHabitsSupabase(userId),
            loadCompletionsSupabase(userId),
            loadCategoriesSupabase(userId),
            loadRpgStatsSupabase(userId),
            loadUserData(userId),
          ]);
        const resetDate = await loadStatsResetDateSupabase(userId);
        setHabits(loadedHabits);
        setCompletions(loadedCompletions);
        setCategories(loadedCategories);
        setRpgStats(loadedRpgStats);
        setXpByDate(userData.xpByDate ?? {});
        setStatsResetDate(resetDate);
      } else {
        setHabits(loadHabits());
        setCompletions(loadCompletions());
        setCategories(loadCategories());
        setRpgStats(loadRpgStats());
        setXpByDate(loadXpByDate());
        setStatsResetDate(loadStatsResetDate());
      }
      setLoading(false);
    }
    loadData();
  }, [useSupabase, userId]);

  const today = new Date().toISOString().slice(0, 10);
  const habitsByDate: Record<string, Habit[]> = {};

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayHabits = habits.map((h) => {
      const rec = completions.find(
        (c) => c.date === dateStr && c.habitId === h.id
      );
      const currentReps = rec?.repetitions ?? 0;
      const completed =
        h.type === "good"
          ? currentReps >= h.targetReps
          : (rec?.completed ?? false);
      const progress =
        h.type === "good" && h.targetReps > 0
          ? Math.min(100, Math.round((currentReps / h.targetReps) * 100))
          : completed
            ? 100
            : 0;
      return {
        ...h,
        currentReps,
        completed,
        progress,
      };
    });
    habitsByDate[dateStr] = dayHabits;
  }

  const daily = getWeeklySummaries(habitsByDate, 7).map((d) => ({
    ...d,
    xp: xpByDate[d.date] ?? d.xp,
  }));

  const habitStats = getHabitStats(habits, completions, 7);

  const goodHabitIds = habits.filter((h) => h.type === "good").map((h) => h.id);
  const streakDays = getGoodHabitStreakDays(goodHabitIds, completions);

  const userStats = computeUserStatsFromHabits(
    habits,
    categories,
    completions,
    rpgStats,
    statsResetDate ?? undefined
  );

  return {
    daily,
    habits: habitStats,
    streakDays,
    userStats,
    rpgStats,
    loading,
  };
}
