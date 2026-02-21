"use client";

import { createClient } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Habit,
  Category,
  UserStats,
  CompletionRecord,
  RpgStat,
} from "./types";

export const UNCATEGORIZED_ID = "uncategorized";

const DEFAULT_RPG_STATS: RpgStat[] = [
  { id: "strength", name: "Strength" },
  { id: "agility", name: "Agility" },
  { id: "weaponMastery", name: "Weapon M." },
  { id: "cursedResistance", name: "Cursed R." },
];

function migrateHabit(
  h: Habit &
    Partial<{
      type?: string;
      categoryId?: string;
      targetReps?: number;
      currentReps?: number;
      difficulty?: string;
      weight?: number;
    }>
): Habit {
  const type = h.type === "bad" || h.type === "good" ? h.type : "good";
  const categoryId = h.categoryId ?? UNCATEGORIZED_ID;
  const targetReps =
    typeof h.targetReps === "number" && h.targetReps >= 1 ? h.targetReps : 1;
  const currentReps =
    typeof h.currentReps === "number"
      ? h.currentReps
      : h.completed
        ? targetReps
        : 0;
  const progress =
    targetReps > 0
      ? Math.min(100, Math.round((currentReps / targetReps) * 100))
      : 0;
  const difficulty = ["easy", "medium", "hard", "brutal"].includes(
    h.difficulty ?? ""
  )
    ? h.difficulty
    : "medium";
  const weight =
    typeof h.weight === "number" ? Math.max(0.8, Math.min(1.5, h.weight)) : 1;
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

function rowToHabit(row: Record<string, unknown>): Habit {
  return migrateHabit({
    id: String(row.id),
    title: String(row.title),
    icon: String(row.icon ?? "sword"),
    type: (row.type as "good" | "bad") ?? "good",
    categoryId: String(row.category_id ?? UNCATEGORIZED_ID),
    targetReps: Number(row.target_reps ?? 1),
    currentReps: Number(row.current_reps ?? 0),
    completed: Boolean(row.completed ?? false),
    progress: Number(row.progress ?? 0),
    difficulty: (row.difficulty as Habit["difficulty"]) ?? "medium",
    weight: Number(row.weight ?? 1),
  });
}

function habitToRow(habit: Habit, userId: string) {
  return {
    id: habit.id,
    user_id: userId,
    title: habit.title,
    icon: habit.icon,
    type: habit.type,
    category_id: habit.categoryId,
    target_reps: habit.targetReps,
    current_reps: habit.currentReps,
    completed: habit.completed,
    progress: habit.progress,
    difficulty: habit.difficulty ?? "medium",
    weight: habit.weight ?? 1,
  };
}

function rowToCategory(row: Record<string, unknown>): Category {
  return {
    id: String(row.id),
    name: String(row.name),
    color: row.color ? String(row.color) : undefined,
    statId: row.stat_id ? String(row.stat_id) : undefined,
    statKey: row.stat_key ? String(row.stat_key) : undefined,
  };
}

function rowToCompletion(row: Record<string, unknown>): CompletionRecord {
  return {
    date: String(row.date),
    habitId: String(row.habit_id),
    completed: Boolean(row.completed),
    progress: row.progress != null ? Number(row.progress) : undefined,
    repetitions: row.repetitions != null ? Number(row.repetitions) : undefined,
  };
}

function rowToRpgStat(row: Record<string, unknown>): RpgStat {
  return {
    id: String(row.id),
    name: String(row.name),
  };
}

export async function ensureUserData(userId: string): Promise<void> {
  const supabase = createClient();
  const { data } = await supabase
    .from("user_data")
    .select("user_id")
    .eq("user_id", userId)
    .single();
  if (!data) {
    await supabase.from("user_data").insert({
      user_id: userId,
      xp_by_date: {},
    });
  }
}

export async function seedDefaultsForNewUser(
  userId: string,
  supabase?: SupabaseClient
): Promise<void> {
  const client = supabase ?? createClient();

  const { data: existingCategories } = await client
    .from("categories")
    .select("id")
    .eq("user_id", userId)
    .limit(1);
  if (!existingCategories?.length) {
    await client.from("categories").insert({
      id: UNCATEGORIZED_ID,
      user_id: userId,
      name: "Uncategorized",
    });
  }

  const { data: existingRpgStats } = await client
    .from("rpg_stats")
    .select("id")
    .eq("user_id", userId)
    .limit(1);
  if (!existingRpgStats?.length) {
    await client.from("rpg_stats").insert(
      DEFAULT_RPG_STATS.map((s) => ({
        id: s.id,
        user_id: userId,
        name: s.name,
      }))
    );
  }

  await ensureUserData(userId);
}

export async function loadHabits(userId: string): Promise<Habit[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", userId);
  if (error) return [];
  if (!data?.length) return [];
  return data.map(rowToHabit);
}

export async function saveHabits(
  userId: string,
  habits: Habit[]
): Promise<void> {
  const supabase = createClient();
  const rows = habits.map((h) => habitToRow(h, userId));
  await supabase.from("habits").upsert(rows, {
    onConflict: "user_id,id",
  });
}

export async function loadCategories(userId: string): Promise<Category[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", userId);
  if (error) return [{ id: UNCATEGORIZED_ID, name: "Uncategorized" }];
  if (!data?.length) return [{ id: UNCATEGORIZED_ID, name: "Uncategorized" }];
  const categories = data.map(rowToCategory);
  if (!categories.some((c) => c.id === UNCATEGORIZED_ID)) {
    return [{ id: UNCATEGORIZED_ID, name: "Uncategorized" }, ...categories];
  }
  return categories;
}

export async function saveCategories(
  userId: string,
  categories: Category[]
): Promise<void> {
  const supabase = createClient();
  const rows = categories.map((c) => ({
    id: c.id,
    user_id: userId,
    name: c.name,
    color: c.color ?? null,
    stat_id: c.statId ?? null,
    stat_key: c.statKey ?? null,
  }));
  await supabase.from("categories").upsert(rows, {
    onConflict: "user_id,id",
  });
}

export async function loadCompletions(
  userId: string
): Promise<CompletionRecord[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("completions")
    .select("*")
    .eq("user_id", userId);
  if (error) return [];
  if (!data?.length) return [];
  return data.map(rowToCompletion);
}

export async function saveCompletions(
  userId: string,
  completions: CompletionRecord[]
): Promise<void> {
  const supabase = createClient();
  const rows = completions.map((c) => ({
    user_id: userId,
    date: c.date,
    habit_id: c.habitId,
    completed: c.completed,
    repetitions: c.repetitions ?? null,
    progress: c.progress ?? null,
  }));
  if (rows.length > 0) {
    await supabase.from("completions").upsert(rows, {
      onConflict: "user_id,date,habit_id",
    });
  }
}

export async function loadRpgStats(userId: string): Promise<RpgStat[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("rpg_stats")
    .select("*")
    .eq("user_id", userId);
  if (error) return DEFAULT_RPG_STATS;
  if (!data?.length) return DEFAULT_RPG_STATS;
  return data.map(rowToRpgStat);
}

export async function saveRpgStats(
  userId: string,
  stats: RpgStat[]
): Promise<void> {
  const supabase = createClient();
  await supabase.from("rpg_stats").delete().eq("user_id", userId);
  if (stats.length > 0) {
    await supabase.from("rpg_stats").insert(
      stats.map((s) => ({ id: s.id, user_id: userId, name: s.name }))
    );
  }
}

export async function loadStatsResetDate(userId: string): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_data")
    .select("stats_reset_date")
    .eq("user_id", userId)
    .single();
  if (error || !data?.stats_reset_date) return null;
  return String(data.stats_reset_date);
}

export async function saveStatsResetDate(userId: string): Promise<void> {
  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);
  await supabase.from("user_data").upsert(
    {
      user_id: userId,
      stats_reset_date: today,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
}

export async function loadUserData(
  userId: string
): Promise<{
  lastActiveDate: string | null;
  lastWeekSeen: string | null;
  xpByDate: Record<string, number>;
}> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_data")
    .select("last_active_date, last_week_seen, xp_by_date")
    .eq("user_id", userId)
    .single();
  if (error) {
    return { lastActiveDate: null, lastWeekSeen: null, xpByDate: {} };
  }
  return {
    lastActiveDate: data?.last_active_date
      ? String(data.last_active_date)
      : null,
    lastWeekSeen: data?.last_week_seen ? String(data.last_week_seen) : null,
    xpByDate: (data?.xp_by_date as Record<string, number>) ?? {},
  };
}

export async function saveUserData(
  userId: string,
  updates: {
    lastActiveDate?: string;
    lastWeekSeen?: string;
    xpByDate?: Record<string, number>;
  }
): Promise<void> {
  const supabase = createClient();
  const { data: existing } = await supabase
    .from("user_data")
    .select("last_active_date, last_week_seen, xp_by_date")
    .eq("user_id", userId)
    .single();

  const payload: Record<string, unknown> = {
    user_id: userId,
    updated_at: new Date().toISOString(),
  };
  if (updates.lastActiveDate !== undefined) {
    payload.last_active_date = updates.lastActiveDate;
  } else if (existing?.last_active_date) {
    payload.last_active_date = existing.last_active_date;
  }
  if (updates.lastWeekSeen !== undefined) {
    payload.last_week_seen = updates.lastWeekSeen;
  } else if (existing?.last_week_seen) {
    payload.last_week_seen = existing.last_week_seen;
  }
  if (updates.xpByDate !== undefined) {
    payload.xp_by_date = updates.xpByDate;
  } else if (existing?.xp_by_date) {
    payload.xp_by_date = existing.xp_by_date;
  }

  await supabase.from("user_data").upsert(payload, { onConflict: "user_id" });
}

export async function clearAllUserData(userId: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("completions").delete().eq("user_id", userId);
  await supabase.from("habits").delete().eq("user_id", userId);
  await supabase.from("categories").delete().eq("user_id", userId);
  await supabase.from("rpg_stats").delete().eq("user_id", userId);
  await supabase.from("user_data").delete().eq("user_id", userId);
}
