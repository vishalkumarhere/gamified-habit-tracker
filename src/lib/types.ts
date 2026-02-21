export interface RpgStat {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  color?: string;
  statId?: string;
  statKey?: string;
}

export type HabitType = "good" | "bad";

export type Difficulty = "easy" | "medium" | "hard" | "brutal";

export interface Habit {
  id: string;
  title: string;
  icon: string;
  type: HabitType;
  categoryId: string;
  targetReps: number;
  currentReps: number;
  completed: boolean;
  progress: number; // computed: (currentReps / targetReps) * 100
  difficulty?: Difficulty;
  weight?: number; // 0.8-1.5, user-defined importance
}

export type UserStats = Record<string, number>;

export interface AvatarStage {
  stage: 1 | 2 | 3 | 4;
  imageUrl: string;
}

export interface DailyState {
  completion: number; // %
  xp: number;
  streak: number;
  avatarStage: AvatarStage;
}

// Stats tab
export interface DailySummary {
  date: string;
  completion: number; // 0–100
  xp: number;
  avatarStage: 1 | 2 | 3 | 4;
}

export interface HabitStats {
  habitId: string;
  title: string;
  successRate: number; // %
  totalCompletions: number;
}

export interface WeeklyStats {
  daily: DailySummary[];
  habits: HabitStats[];
  streakDays: string[]; // ISO dates
}

export interface CompletionRecord {
  date: string; // ISO date
  habitId: string;
  completed: boolean;
  progress?: number;
  repetitions?: number;
}
