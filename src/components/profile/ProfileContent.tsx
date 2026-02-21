"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import {
  loadHabits,
  loadCompletions,
  loadUserStats,
  loadCategories,
} from "@/lib/storage";
import {
  loadHabits as loadHabitsSupabase,
  loadCompletions as loadCompletionsSupabase,
  loadCategories as loadCategoriesSupabase,
  loadRpgStats as loadRpgStatsSupabase,
  loadUserData,
  clearAllUserData,
} from "@/lib/storage-supabase";
import { useUser, useSupabaseEnabled } from "@/hooks/useUser";

export function ProfileContent() {
  const [exported, setExported] = useState(false);
  const [resetting, setResetting] = useState(false);
  const { user } = useUser();
  const useSupabase = useSupabaseEnabled() && !!user;
  const userId = user?.id ?? "";

  const handleExport = async () => {
    if (useSupabase && userId) {
      const [habits, completions, categories, rpgStats, userData] =
        await Promise.all([
          loadHabitsSupabase(userId),
          loadCompletionsSupabase(userId),
          loadCategoriesSupabase(userId),
          loadRpgStatsSupabase(userId),
          loadUserData(userId),
        ]);
      const data = {
        habits,
        categories,
        completions,
        stats: {},
        xpByDate: userData.xpByDate ?? {},
        exportedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `habit-tracker-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const data = {
        habits: loadHabits(),
        categories: loadCategories(),
        completions: loadCompletions(),
        stats: loadUserStats(),
        xpByDate: (() => {
          try {
            const raw = localStorage.getItem("assassin-xp-by-date");
            return raw ? JSON.parse(raw) : {};
          } catch {
            return {};
          }
        })(),
        exportedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `habit-tracker-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  const handleReset = async () => {
    if (typeof window === "undefined") return;
    if (!confirm("Reset all data? This cannot be undone.")) return;
    setResetting(true);
    try {
      if (useSupabase && userId) {
        await clearAllUserData(userId);
      } else {
        localStorage.removeItem("assassin-habits");
        localStorage.removeItem("assassin-stats");
        localStorage.removeItem("assassin-completions");
        localStorage.removeItem("assassin-xp-by-date");
        localStorage.removeItem("assassin-total-xp");
        localStorage.removeItem("assassin-last-week-seen");
        localStorage.removeItem("assassin-categories");
        localStorage.removeItem("assassin-rpg-stats");
        localStorage.removeItem("assassin-stats-reset-date");
        localStorage.removeItem("assassin-last-active-date");
      }
      window.location.reload();
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <Card className="bg-[#0A0A0A] border-[#1F1F1F]">
        <CardHeader>
          <CardTitle className="text-base">Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start border-[#1F1F1F] hover:bg-[#1A1A1A]"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            {exported ? "Exported!" : "Export data"}
          </Button>
          <Button
            variant="outline"
            disabled={resetting}
            className="w-full justify-start border-destructive/50 text-destructive hover:bg-destructive/10"
            onClick={handleReset}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {resetting ? "Resetting…" : "Reset progress"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
