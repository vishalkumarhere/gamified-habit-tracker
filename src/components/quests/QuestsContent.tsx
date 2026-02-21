"use client";

import { useMemo, useState } from "react";
import type { Habit } from "@/lib/types";
import { useHabits } from "@/hooks/useHabits";
import { useCategories } from "@/hooks/useCategories";
import { useRpgStats } from "@/hooks/useRpgStats";
import { HabitCard } from "@/components/HabitCard";
import { AddHabitDialog } from "@/components/dashboard/AddHabitDialog";
import { EditHabitDialog } from "./EditHabitDialog";
import { CategoryManager } from "@/components/categories/CategoryManager";
import { RpgStatsManager } from "@/components/rpg/RpgStatsManager";
import { LayoutGrid, Swords, Target } from "lucide-react";
import { UNCATEGORIZED_ID } from "@/lib/storage";

export function QuestsContent() {
  const { habits, addHabit, updateHabit, deleteHabit } = useHabits();
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();
  const { rpgStats, addRpgStat, updateRpgStat, deleteRpgStat } = useRpgStats();
  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories]
  );
  const goodHabits = habits.filter((h) => h.type === "good");
  const badHabits = habits.filter((h) => h.type === "bad");
  const hasHabits = habits.length > 0;

  const openEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setEditOpen(true);
  };

  const handleSaveEdit = (
    id: string,
    updates: Partial<Pick<Habit, "title" | "type" | "categoryId" | "targetReps" | "difficulty" | "weight">>
  ) => {
    updateHabit(id, updates);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-muted-foreground">
          Manage habits and categories
        </p>
        <AddHabitDialog
          onAdd={addHabit}
          categories={categories}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl p-3 flex items-center gap-3">
          <LayoutGrid className="h-5 w-5 text-[#0FA958]" />
          <div>
            <p className="text-2xl font-[family-name:var(--font-jetbrains-mono)] font-bold">
              {habits.length}
            </p>
            <p className="text-xs text-muted-foreground">Total habits</p>
          </div>
        </div>
        <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl p-3 flex items-center gap-3">
          <Target className="h-5 w-5 text-[#0FA958]" />
          <div>
            <p className="text-2xl font-[family-name:var(--font-jetbrains-mono)] font-bold">
              {categories.filter((c) => c.id !== UNCATEGORIZED_ID).length}
            </p>
            <p className="text-xs text-muted-foreground">Categories</p>
          </div>
        </div>
      </div>

      <CategoryManager
        categories={categories}
        rpgStats={rpgStats}
        addCategory={addCategory}
        updateCategory={updateCategory}
        deleteCategory={deleteCategory}
      />

      <RpgStatsManager
        rpgStats={rpgStats}
        addRpgStat={addRpgStat}
        updateRpgStat={updateRpgStat}
        deleteRpgStat={deleteRpgStat}
      />

      <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl p-4">
        <h3 className="font-medium mb-2 flex items-center gap-2">
          <Swords className="h-4 w-4" />
          Habits
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Manage your habits. Go to Dashboard to log daily progress.
        </p>
        {hasHabits ? (
          <div className="space-y-3">
            {goodHabits.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                  Good
                </p>
                {goodHabits.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    categoryName={categoryMap.get(habit.categoryId)}
                    onEdit={openEdit}
                    onDelete={() => deleteHabit(habit.id)}
                  />
                ))}
              </div>
            )}
            {badHabits.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2 mt-4 uppercase tracking-wider">
                  Bad
                </p>
                {badHabits.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    categoryName={categoryMap.get(habit.categoryId)}
                    onEdit={openEdit}
                    onDelete={() => deleteHabit(habit.id)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground border border-dashed border-[#1F1F1F] rounded-lg">
            <p className="mb-1">No habits yet</p>
            <p className="text-sm">Click Add above to create your first habit.</p>
          </div>
        )}
      </div>

      <EditHabitDialog
        habit={editingHabit}
        categories={categories}
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditingHabit(null);
        }}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
