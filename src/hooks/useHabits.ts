"use client";

import { useState, useEffect, useCallback } from "react";
import type { Habit, HabitType } from "@/lib/types";
import {
  loadHabits,
  saveHabits,
  loadUserStats,
  loadCompletions,
  saveCompletions,
} from "@/lib/storage";
import {
  loadHabits as loadHabitsSupabase,
  saveHabits as saveHabitsSupabase,
  loadCompletions as loadCompletionsSupabase,
  saveCompletions as saveCompletionsSupabase,
  loadUserData,
  saveUserData,
} from "@/lib/storage-supabase";
import { useUser, useSupabaseEnabled } from "@/hooks/useUser";
import { computeDailyCompletion } from "@/lib/habits";
import { getAvatarStage } from "@/lib/evolution";
import { calculateDailyXP, xpProgressInLevel, getAssassinRank } from "@/lib/xp";
import { calculateStreak, getGoodHabitStreakDays } from "@/lib/habits";

const LAST_ACTIVE_DATE_KEY = "assassin-last-active-date";

function generateId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `habit-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function resetDailyProgress(habits: Habit[]): Habit[] {
  return habits.map((h) => ({
    ...h,
    currentReps: 0,
    completed: false,
    progress: 0,
  }));
}

function updateHabitProgress(h: Habit): Habit {
  const progress =
    h.targetReps > 0
      ? Math.min(100, Math.round((h.currentReps / h.targetReps) * 100))
      : 0;
  const completed =
    h.type === "good" ? h.currentReps >= h.targetReps : h.completed;
  return { ...h, progress, completed };
}

export function useHabits() {
  const { user } = useUser();
  const useSupabase = useSupabaseEnabled() && !!user;
  const userId = user?.id ?? "";

  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<
    Array<{ date: string; habitId: string; completed: boolean; repetitions?: number }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [xpByDate, setXpByDate] = useState<Record<string, number>>({});

  const loadData = useCallback(async () => {
    if (useSupabase && userId) {
      const [loadedHabits, loadedCompletions, userData] = await Promise.all([
        loadHabitsSupabase(userId),
        loadCompletionsSupabase(userId),
        loadUserData(userId),
      ]);

      const today = new Date().toISOString().slice(0, 10);
      let habitsToUse = loadedHabits;

      if (userData.lastActiveDate !== today) {
        habitsToUse = resetDailyProgress(habitsToUse);
        await saveHabitsSupabase(userId, habitsToUse);
        await saveUserData(userId, { lastActiveDate: today });
      }

      const todayRecords = loadedCompletions.filter((c) => c.date === today);
      const hydrated = habitsToUse.map((h) => {
        const rec = todayRecords.find((r) => r.habitId === h.id);
        const reps =
          rec?.repetitions ??
          (userData.lastActiveDate === today ? h.currentReps : 0);
        return updateHabitProgress({ ...h, currentReps: reps });
      });

      const completionsToUse =
        todayRecords.length === 0 && loadedHabits.length > 0
          ? loadedCompletions
              .filter((c) => c.date !== today)
              .concat(
                hydrated.map((h) => ({
                  date: today,
                  habitId: h.id,
                  completed: h.completed,
                  repetitions: h.currentReps,
                }))
              )
          : loadedCompletions;

      if (todayRecords.length === 0 && loadedHabits.length > 0) {
        await saveCompletionsSupabase(userId, completionsToUse);
      }

      setHabits(hydrated);
      setCompletions(completionsToUse);
      setXpByDate(userData.xpByDate ?? {});
    } else {
      const today = new Date().toISOString().slice(0, 10);
      const lastActive =
        typeof window !== "undefined"
          ? localStorage.getItem(LAST_ACTIVE_DATE_KEY)
          : null;

      let loaded = loadHabits();
      const loadedCompletions = loadCompletions();

      if (lastActive !== today && typeof window !== "undefined") {
        loaded = resetDailyProgress(loaded);
        saveHabits(loaded);
        localStorage.setItem(LAST_ACTIVE_DATE_KEY, today);
      }

      const todayRecords = loadedCompletions.filter((c) => c.date === today);
      const hydrated = loaded.map((h) => {
        const rec = todayRecords.find((r) => r.habitId === h.id);
        const reps =
          rec?.repetitions ?? (lastActive === today ? h.currentReps : 0);
        return updateHabitProgress({ ...h, currentReps: reps });
      });

      setHabits(hydrated);

      if (todayRecords.length === 0 && loaded.length > 0) {
        const merged = loadedCompletions
          .filter((c) => c.date !== today)
          .concat(
            hydrated.map((h) => ({
              date: today,
              habitId: h.id,
              completed: h.completed,
              repetitions: h.currentReps,
            }))
          );
        setCompletions(merged);
        saveCompletions(merged);
      } else {
        setCompletions(loadedCompletions);
      }

      try {
        const raw = localStorage.getItem("assassin-xp-by-date");
        setXpByDate(raw ? JSON.parse(raw) : {});
      } catch {
        setXpByDate({});
      }
    }
    setLoading(false);
  }, [useSupabase, userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const syncCompletions = useCallback(
    async (newHabits: Habit[]) => {
      const today = new Date().toISOString().slice(0, 10);
      const existing = completions.filter((c) => c.date !== today);
      const todayRecords = newHabits.map((h) => ({
        date: today,
        habitId: h.id,
        completed: h.completed,
        repetitions: h.currentReps,
      }));
      const merged = [...existing, ...todayRecords];
      setCompletions(merged);

      if (useSupabase && userId) {
        await saveCompletionsSupabase(userId, merged);
      } else {
        saveCompletions(merged);
      }
    },
    [completions, useSupabase, userId]
  );

  const persistHabits = useCallback(
    async (updated: Habit[]) => {
      if (useSupabase && userId) {
        await saveHabitsSupabase(userId, updated);
      } else {
        saveHabits(updated);
      }
    },
    [useSupabase, userId]
  );

  const incrementRep = useCallback(
    async (habit: Habit) => {
      const updated = habits.map((h) => {
        if (h.id !== habit.id) return h;
        const newReps = h.currentReps + 1;
        let next = { ...h, currentReps: newReps };
        if (h.type === "good" && newReps >= h.targetReps) {
          next = { ...next, completed: true };
        }
        return updateHabitProgress(next);
      });
      setHabits(updated);
      await persistHabits(updated);
      await syncCompletions(updated);
    },
    [habits, persistHabits, syncCompletions]
  );

  const toggleHabit = useCallback(
    async (habit: Habit) => {
      const updated = habits.map((h) => {
        if (h.id !== habit.id) return h;
        if (h.type === "good") {
          if (h.completed) {
            const newReps = Math.max(0, h.currentReps - 1);
            return updateHabitProgress({ ...h, currentReps: newReps });
          }
          if (h.targetReps > 1) {
            const newReps = Math.min(h.targetReps, h.currentReps + 1);
            return updateHabitProgress({ ...h, currentReps: newReps });
          }
          return updateHabitProgress({ ...h, currentReps: h.targetReps });
        }
        return h;
      });
      setHabits(updated);
      await persistHabits(updated);
      await syncCompletions(updated);
    },
    [habits, persistHabits, syncCompletions]
  );

  const setReps = useCallback(
    async (habit: Habit, reps: number) => {
      const max = habit.type === "good" ? habit.targetReps : 20;
      const clamped = Math.max(0, Math.min(max, Math.round(reps)));
      const updated = habits.map((h) =>
        h.id === habit.id
          ? updateHabitProgress({ ...h, currentReps: clamped })
          : h
      );
      setHabits(updated);
      await persistHabits(updated);
      await syncCompletions(updated);
    },
    [habits, persistHabits, syncCompletions]
  );

  const addHabit = useCallback(
    async (
      title: string,
      type: HabitType,
      categoryId: string,
      targetReps: number,
      difficulty?: Habit["difficulty"],
      weight?: number
    ) => {
      const newHabit: Habit = {
        id: generateId(),
        title,
        icon: "sword",
        type,
        categoryId,
        targetReps: Math.max(1, targetReps),
        currentReps: 0,
        completed: false,
        progress: 0,
        difficulty: difficulty ?? "medium",
        weight: weight != null ? Math.max(0.8, Math.min(1.5, weight)) : 1,
      };
      const updated = [...habits, newHabit];
      setHabits(updated);
      await persistHabits(updated);
    },
    [habits, persistHabits]
  );

  const deleteHabit = useCallback(
    async (id: string) => {
      const updated = habits.filter((h) => h.id !== id);
      setHabits(updated);
      await persistHabits(updated);
    },
    [habits, persistHabits]
  );

  const updateHabit = useCallback(
    async (
      id: string,
      updates: Partial<
        Pick<
          Habit,
          "title" | "type" | "categoryId" | "targetReps" | "difficulty" | "weight"
        >
      >
    ) => {
      const updated = habits.map((h) => {
        if (h.id !== id) return h;
        const next = { ...h, ...updates };
        if (updates.weight != null) {
          next.weight = Math.max(0.8, Math.min(1.5, updates.weight));
        }
        return updateHabitProgress(next);
      });
      setHabits(updated);
      await persistHabits(updated);
    },
    [habits, persistHabits]
  );

  const completion = computeDailyCompletion(habits);
  const avatarStage = getAvatarStage(completion);

  const goodHabitIds = habits.filter((h) => h.type === "good").map((h) => h.id);
  const streakDays = getGoodHabitStreakDays(goodHabitIds, completions);
  const streak = calculateStreak(streakDays);

  const dailyXp = calculateDailyXP(habits, streak);
  const today =
    typeof window !== "undefined"
      ? new Date().toISOString().slice(0, 10)
      : "";

  useEffect(() => {
    if (!today) return;
    const hasActivity = habits.some((h) => h.completed || h.currentReps > 0);
    if (hasActivity) {
      const xp = calculateDailyXP(habits, streak);
      setXpByDate((prev) => {
        const next = { ...prev, [today]: xp };
        if (!useSupabase && typeof window !== "undefined") {
          localStorage.setItem("assassin-xp-by-date", JSON.stringify(next));
        }
        return next;
      });
    }
  }, [
    today,
    habits.map((h) => `${h.id}:${h.completed}:${h.currentReps}`).join(","),
    streak,
  ]);

  useEffect(() => {
    if (!today || !useSupabase || !userId || Object.keys(xpByDate).length === 0)
      return;
    const next = { ...xpByDate, [today]: calculateDailyXP(habits, streak) };
    saveUserData(userId, { xpByDate: next });
  }, [
    today,
    useSupabase,
    userId,
    xpByDate,
    habits.map((h) => `${h.id}:${h.completed}:${h.currentReps}`).join(","),
    streak,
  ]);

  const totalXp = Object.values(xpByDate).reduce((a, b) => a + b, 0);
  const assassinRank = getAssassinRank(totalXp);
  const userStats = loadUserStats();

  return {
    habits,
    loading,
    toggleHabit,
    incrementRep,
    setReps,
    addHabit,
    updateHabit,
    deleteHabit,
    completion,
    avatarStage,
    dailyXp,
    totalXp,
    assassinRank,
    userStats,
    streak,
    completions,
  };
}
