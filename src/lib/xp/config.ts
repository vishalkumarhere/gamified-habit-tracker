import type { CategoryConfig } from "./types";

export const BASE_XP = 10;

export const difficultyWeights: Record<
  "easy" | "medium" | "hard" | "brutal",
  number
> = {
  easy: 0.8,
  medium: 1.0,
  hard: 1.3,
  brutal: 1.6,
};

export const categoryConfig: Record<string, CategoryConfig> = {
  fitness: { stat: "strength", weight: 1.2 },
  learning: { stat: "weaponMastery", weight: 1.1 },
  discipline: { stat: "cursedResistance", weight: 1.3 },
  creativity: { stat: "agility", weight: 1.0 },
};

export function getStreakMultiplier(streak: number): number {
  if (streak <= 3) return 1.0;
  if (streak <= 7) return 1.1;
  if (streak <= 14) return 1.25;
  return 1.5;
}
