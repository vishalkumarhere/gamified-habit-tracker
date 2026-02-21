import type { XPHabit, StreakState, XPResult, CategoryConfig } from "./types";
import { BASE_XP, difficultyWeights, categoryConfig } from "./config";

function getCategoryConfig(category: string): CategoryConfig {
  const key = category.toLowerCase();
  return (
    categoryConfig[key] ?? {
      stat: "strength",
      weight: 1.0,
    }
  );
}

/**
 * Calculates XP for a single habit completion.
 * @param totalPositiveXPSoFar - Sum of positive XP from habits completed earlier today (needed for momentum)
 */
export function calculateXP(
  habit: XPHabit,
  streak: StreakState,
  totalPositiveXPSoFar: number,
  dailyCompletion: number
): XPResult {
  const catConfig = getCategoryConfig(habit.category);
  const diffWeight = difficultyWeights[habit.difficulty];
  const clampedWeight = Math.max(0.8, Math.min(1.5, habit.weight));

  let xpGained = 0;
  let xpPenalty = 0;
  const statGains: Record<string, number> = {};

  if (habit.isNegative) {
    xpPenalty =
      BASE_XP * clampedWeight * catConfig.weight * 0.7;
    statGains[catConfig.stat] = -0.5 * catConfig.weight;
  } else {
    xpGained =
      BASE_XP *
      clampedWeight *
      catConfig.weight *
      diffWeight *
      streak.multiplier;
    statGains[catConfig.stat] = xpGained * 0.2;
  }

  const momentumBonus =
    dailyCompletion === 100 ? (totalPositiveXPSoFar + xpGained) * 0.15 : 0;

  const finalXP = Math.max(0, xpGained - xpPenalty + momentumBonus);

  return {
    xpGained,
    xpPenalty,
    statGains,
    streakMultiplier: streak.multiplier,
    momentumBonus,
    finalXP,
  };
}
