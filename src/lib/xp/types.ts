export type Difficulty = "easy" | "medium" | "hard" | "brutal";

export interface XPHabit {
  id: string;
  title: string;
  category: string;
  difficulty: Difficulty;
  weight: number;
  isNegative: boolean;
}

export interface CategoryConfig {
  stat: string;
  weight: number;
}

export interface StreakState {
  currentStreak: number;
  multiplier: number;
}

export interface XPResult {
  xpGained: number;
  xpPenalty: number;
  statGains: Record<string, number>;
  streakMultiplier: number;
  momentumBonus: number;
  finalXP: number;
}
