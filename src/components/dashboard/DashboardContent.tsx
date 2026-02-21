"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { AvatarStage } from "@/components/AvatarStage";
import { XPBar } from "@/components/XPBar";
import { StatsPanel } from "@/components/StatsPanel";
import { HabitCard } from "@/components/HabitCard";
import { useHabits } from "@/hooks/useHabits";
import { useCategories } from "@/hooks/useCategories";
import { useRpgStats } from "@/hooks/useRpgStats";
import { computeUserStatsFromHabits } from "@/lib/stats";
import { loadStatsResetDate, saveStatsResetDate } from "@/lib/storage";
import {
  loadStatsResetDate as loadStatsResetDateSupabase,
  saveStatsResetDate as saveStatsResetDateSupabase,
} from "@/lib/storage-supabase";
import { useUser, useSupabaseEnabled } from "@/hooks/useUser";
import { Flame } from "lucide-react";
import { xpProgressInLevel } from "@/lib/xp";

export function DashboardContent() {
  const {
    habits,
    setReps,
    avatarStage,
    dailyXp,
    assassinRank,
    completions,
    streak,
    totalXp,
  } = useHabits();
  const { categories } = useCategories();
  const { rpgStats } = useRpgStats();
  const { user } = useUser();
  const useSupabase = useSupabaseEnabled() && !!user;
  const userId = user?.id ?? "";

  const [statsResetDate, setStatsResetDate] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (useSupabase && userId) {
        const date = await loadStatsResetDateSupabase(userId);
        setStatsResetDate(date);
      } else if (typeof window !== "undefined") {
        setStatsResetDate(loadStatsResetDate());
      }
    }
    load();
  }, [useSupabase, userId]);

  const xpProgress = xpProgressInLevel(totalXp);
  const userStats = useMemo(
    () =>
      computeUserStatsFromHabits(
        habits,
        categories,
        completions,
        rpgStats,
        statsResetDate ?? undefined
      ),
    [habits, categories, completions, rpgStats, statsResetDate]
  );

  const handleResetStats = useCallback(async () => {
    if (
      !confirm(
        "Reset all RPG stats to base (20)? Completion history will be cleared for stat calculation."
      )
    )
      return;
    const today = new Date().toISOString().slice(0, 10);
    if (useSupabase && userId) {
      await saveStatsResetDateSupabase(userId);
    } else {
      saveStatsResetDate();
    }
    setStatsResetDate(today);
  }, [useSupabase, userId]);

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories]
  );

  const goodHabits = habits.filter((h) => h.type === "good");
  const badHabits = habits.filter((h) => h.type === "bad");

  return (
    <div className="space-y-6">
      {/* Top: Avatar + XP + Rank */}
      <div className="sticky top-0 z-10 bg-[#050505] pb-4 border-b border-[#1F1F1F]">
        <div className="flex items-center gap-4">
          <AvatarStage stage={avatarStage} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-sm text-muted-foreground">
                Assassin Rank {assassinRank}
              </span>
              <span className="text-sm font-[family-name:var(--font-jetbrains-mono)] text-[#0FA958]">
                +{dailyXp} XP today
              </span>
            </div>
            <XPBar value={xpProgress} />
          </div>
        </div>
      </div>

      {/* Stats Panel */}
      <StatsPanel
        stats={userStats}
        categories={categories}
        rpgStats={rpgStats}
        onResetStats={handleResetStats}
      />

      {/* Good Habits */}
      <div>
        <h2 className="text-lg font-semibold font-[family-name:var(--font-inter-tight)] mb-3">
          Good Habits
        </h2>
        <div className="space-y-2">
          {goodHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              categoryName={categoryMap.get(habit.categoryId)}
              onSetReps={setReps}
            />
          ))}
        </div>
      </div>

      {/* Bad Habits */}
      {badHabits.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold font-[family-name:var(--font-inter-tight)] mb-3">
            Bad Habits
          </h2>
          <div className="space-y-2">
            {badHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                categoryName={categoryMap.get(habit.categoryId)}
                onSetReps={setReps}
              />
            ))}
          </div>
        </div>
      )}

      {/* Streak */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Flame className="h-4 w-4 text-[#0FA958]" />
        <span>Streak: {streak} days</span>
      </div>
    </div>
  );
}
