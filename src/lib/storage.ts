"use client";

import type { Habit, Category, UserStats, CompletionRecord, RpgStat } from "./types";

const HABITS_KEY = "assassin-habits";
const CATEGORIES_KEY = "assassin-categories";
const RPG_STATS_KEY = "assassin-rpg-stats";
const STATS_KEY = "assassin-stats";
const COMPLETIONS_KEY = "assassin-completions";
const STATS_RESET_DATE_KEY = "assassin-stats-reset-date";

export const UNCATEGORIZED_ID = "uncategorized";

export function loadStatsResetDate(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STATS_RESET_DATE_KEY);
}

export function saveStatsResetDate(): void {
  if (typeof window === "undefined") return;
  const today = new Date().toISOString().slice(0, 10);
  localStorage.setItem(STATS_RESET_DATE_KEY, today);
}

export function loadCategories(): Category[] {
  if (typeof window === "undefined") return getDefaultCategories();
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY);
    if (!raw) return getDefaultCategories();
    const parsed = JSON.parse(raw) as Category[];
    if (!Array.isArray(parsed)) return getDefaultCategories();
    if (!parsed.some((c) => c.id === UNCATEGORIZED_ID)) {
      return [{ id: UNCATEGORIZED_ID, name: "Uncategorized" }, ...parsed];
    }
    const rpgStats = loadRpgStats();
    return parsed.map((c) => {
      if (c.statId) return c;
      if (c.statKey && rpgStats.some((s) => s.id === c.statKey)) {
        return { ...c, statId: c.statKey };
      }
      return c;
    });
  } catch {
    return getDefaultCategories();
  }
}

export function saveCategories(categories: Category[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

const DEFAULT_RPG_STATS: RpgStat[] = [
  { id: "strength", name: "Strength" },
  { id: "agility", name: "Agility" },
  { id: "weaponMastery", name: "Weapon M." },
  { id: "cursedResistance", name: "Cursed R." },
];

export function loadRpgStats(): RpgStat[] {
  if (typeof window === "undefined") return DEFAULT_RPG_STATS;
  try {
    const raw = localStorage.getItem(RPG_STATS_KEY);
    if (raw === null || raw === undefined) return DEFAULT_RPG_STATS;
    const parsed = JSON.parse(raw) as RpgStat[];
    return Array.isArray(parsed) ? parsed : DEFAULT_RPG_STATS;
  } catch {
    return DEFAULT_RPG_STATS;
  }
}

export function saveRpgStats(stats: RpgStat[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(RPG_STATS_KEY, JSON.stringify(stats));
}

export function loadHabits(): Habit[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HABITS_KEY);
    if (!raw) return getDefaultHabits();
    const parsed = JSON.parse(raw) as Habit[];
    if (!Array.isArray(parsed)) return getDefaultHabits();
    return parsed.map((h) => migrateHabit(h));
  } catch {
    return getDefaultHabits();
  }
}

function migrateHabit(h: Habit & Partial<{ type?: string; categoryId?: string; targetReps?: number; currentReps?: number; difficulty?: string; weight?: number }>): Habit {
  const type = (h.type === "bad" || h.type === "good") ? h.type : "good";
  const categoryId = h.categoryId ?? UNCATEGORIZED_ID;
  const targetReps = typeof h.targetReps === "number" && h.targetReps >= 1 ? h.targetReps : 1;
  const currentReps = typeof h.currentReps === "number" ? h.currentReps : (h.completed ? targetReps : 0);
  const progress = targetReps > 0 ? Math.min(100, Math.round((currentReps / targetReps) * 100)) : 0;
  const difficulty = ["easy", "medium", "hard", "brutal"].includes(h.difficulty ?? "") ? h.difficulty : "medium";
  const weight = typeof h.weight === "number" ? Math.max(0.8, Math.min(1.5, h.weight)) : 1;
  return {
    ...h,
    type,
    categoryId,
    targetReps,
    currentReps,
    progress,
    difficulty: difficulty as Habit["difficulty"],
    weight,
  };
}

export function saveHabits(habits: Habit[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
}

export function loadUserStats(): UserStats {
  if (typeof window === "undefined") return getDefaultStats();
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return getDefaultStats();
    return JSON.parse(raw) as UserStats;
  } catch {
    return getDefaultStats();
  }
}

export function saveUserStats(stats: UserStats): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function loadCompletions(): CompletionRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(COMPLETIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CompletionRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCompletions(completions: CompletionRecord[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(COMPLETIONS_KEY, JSON.stringify(completions));
}

function getDefaultCategories(): Category[] {
  return [{ id: UNCATEGORIZED_ID, name: "Uncategorized" }];
}

function getDefaultHabits(): Habit[] {
  return [
    { id: "1", title: "Morning Run", icon: "sword", type: "good", categoryId: UNCATEGORIZED_ID, targetReps: 1, currentReps: 0, completed: false, progress: 0 },
    { id: "2", title: "Read 10 pages", icon: "sword", type: "good", categoryId: UNCATEGORIZED_ID, targetReps: 1, currentReps: 0, completed: false, progress: 0 },
    { id: "3", title: "Meditate", icon: "sword", type: "good", categoryId: UNCATEGORIZED_ID, targetReps: 1, currentReps: 0, completed: false, progress: 0 },
    { id: "4", title: "Code 1 hour", icon: "sword", type: "good", categoryId: UNCATEGORIZED_ID, targetReps: 1, currentReps: 0, completed: false, progress: 0 },
  ];
}

function getDefaultStats(): UserStats {
  return {};
}
