"use client";

import { useState, useEffect, useCallback } from "react";
import type { RpgStat } from "@/lib/types";
import {
  loadRpgStats,
  saveRpgStats,
  loadCategories,
  saveCategories,
} from "@/lib/storage";
import {
  loadRpgStats as loadRpgStatsSupabase,
  saveRpgStats as saveRpgStatsSupabase,
  loadCategories as loadCategoriesSupabase,
  saveCategories as saveCategoriesSupabase,
} from "@/lib/storage-supabase";
import { useUser, useSupabaseEnabled } from "@/hooks/useUser";

function generateId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `rpg-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function useRpgStats() {
  const { user } = useUser();
  const useSupabase = useSupabaseEnabled() && !!user;
  const userId = user?.id ?? "";

  const [rpgStats, setRpgStats] = useState<RpgStat[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (useSupabase && userId) {
      const loaded = await loadRpgStatsSupabase(userId);
      setRpgStats(loaded);
    } else {
      setRpgStats(loadRpgStats());
    }
    setLoading(false);
  }, [useSupabase, userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addRpgStat = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      const exists = rpgStats.some(
        (s) => s.name.toLowerCase() === trimmed.toLowerCase()
      );
      if (exists) return;
      const newStat: RpgStat = { id: generateId(), name: trimmed };
      const updated = [...rpgStats, newStat];
      setRpgStats(updated);
      if (useSupabase && userId) {
        await saveRpgStatsSupabase(userId, updated);
      } else {
        saveRpgStats(updated);
      }
    },
    [rpgStats, useSupabase, userId]
  );

  const updateRpgStat = useCallback(
    async (id: string, name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      const updated = rpgStats.map((s) =>
        s.id === id ? { ...s, name: trimmed } : s
      );
      setRpgStats(updated);
      if (useSupabase && userId) {
        await saveRpgStatsSupabase(userId, updated);
      } else {
        saveRpgStats(updated);
      }
    },
    [rpgStats, useSupabase, userId]
  );

  const deleteRpgStat = useCallback(
    async (id: string) => {
      if (useSupabase && userId) {
        const categories = await loadCategoriesSupabase(userId);
        const updatedCats = categories.map((c) =>
          c.statId === id
            ? { ...c, statId: undefined, statKey: undefined }
            : c
        );
        await saveCategoriesSupabase(userId, updatedCats);
      } else {
        const categories = loadCategories();
        const updatedCats = categories.map((c) =>
          c.statId === id
            ? { ...c, statId: undefined, statKey: undefined }
            : c
        );
        saveCategories(updatedCats);
      }
      const updated = rpgStats.filter((s) => s.id !== id);
      setRpgStats(updated);
      if (useSupabase && userId) {
        await saveRpgStatsSupabase(userId, updated);
      } else {
        saveRpgStats(updated);
      }
    },
    [rpgStats, useSupabase, userId]
  );

  return { rpgStats, loading, addRpgStat, updateRpgStat, deleteRpgStat };
}
