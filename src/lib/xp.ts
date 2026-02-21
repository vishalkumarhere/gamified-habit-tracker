import type { Habit } from "./types";

const XP_PER_HABIT = 25;
const XP_BONUS_FULL_COMPLETION = 50;
const XP_PER_STREAK_DAY = 5;
const XP_PER_LEVEL = 100;
const XP_LOSS_PER_BAD_REP = 10;

export function calculateDailyXPFromBadHabits(badHabitReps: number): number {
  return -(badHabitReps * XP_LOSS_PER_BAD_REP);
}

export function calculateDailyXP(
  habits: Habit[],
  streak: number = 0,
  badHabitReps?: number
): number {
  const goodHabits = habits.filter((h) => h.type === "good");
  const completedCount = goodHabits.filter((h) => h.completed).length;
  const totalGoodCount = goodHabits.length;
  let xp = completedCount * XP_PER_HABIT;

  if (totalGoodCount > 0 && completedCount === totalGoodCount) {
    xp += XP_BONUS_FULL_COMPLETION;
  }

  xp += Math.min(streak * XP_PER_STREAK_DAY, 50);

  const reps = badHabitReps ?? habits.filter((h) => h.type === "bad").reduce((sum, h) => sum + h.currentReps, 0);
  xp += calculateDailyXPFromBadHabits(reps);

  return Math.max(0, xp);
}

export function xpToLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function xpProgressInLevel(xp: number): number {
  const remainder = xp % XP_PER_LEVEL;
  return (remainder / XP_PER_LEVEL) * 100;
}

export function getAssassinRank(totalXp: number): number {
  return xpToLevel(totalXp);
}
