import type { Habit, Category } from "@/lib/types";
import type { XPHabit } from "./types";

/**
 * Converts app Habit + Category lookup to XPHabit for the XP engine.
 */
export function habitToXPHabit(
  habit: Habit,
  getCategoryName: (categoryId: string) => string
): XPHabit {
  const categoryName = getCategoryName(habit.categoryId) || "Uncategorized";
  return {
    id: habit.id,
    title: habit.title,
    category: categoryName,
    difficulty: habit.difficulty ?? "medium",
    weight: habit.weight ?? 1,
    isNegative: habit.type === "bad",
  };
}
