"use client";

import { useState, useEffect, useCallback } from "react";
import type { Category } from "@/lib/types";
import {
  loadCategories,
  saveCategories,
  loadHabits,
  saveHabits,
} from "@/lib/storage";
import { UNCATEGORIZED_ID } from "@/lib/storage";
import {
  loadCategories as loadCategoriesSupabase,
  saveCategories as saveCategoriesSupabase,
  loadHabits as loadHabitsSupabase,
  saveHabits as saveHabitsSupabase,
} from "@/lib/storage-supabase";
import { useUser, useSupabaseEnabled } from "@/hooks/useUser";

function generateId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `cat-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function useCategories() {
  const { user } = useUser();
  const useSupabase = useSupabaseEnabled() && !!user;
  const userId = user?.id ?? "";

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (useSupabase && userId) {
      const loaded = await loadCategoriesSupabase(userId);
      setCategories(loaded);
    } else {
      setCategories(loadCategories());
    }
    setLoading(false);
  }, [useSupabase, userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addCategory = useCallback(
    async (name: string, statId?: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      const exists = categories.some(
        (c) => c.name.toLowerCase() === trimmed.toLowerCase()
      );
      if (exists) return;
      const newCategory: Category = {
        id: generateId(),
        name: trimmed,
        statId,
      };
      const updated = [...categories, newCategory];
      setCategories(updated);
      if (useSupabase && userId) {
        await saveCategoriesSupabase(userId, updated);
      } else {
        saveCategories(updated);
      }
    },
    [categories, useSupabase, userId]
  );

  const updateCategory = useCallback(
    async (id: string, updates: { name?: string; statId?: string }) => {
      if (id === UNCATEGORIZED_ID) return;
      const updated = categories.map((c) => {
        if (c.id !== id) return c;
        const name = updates.name?.trim();
        return {
          ...c,
          ...(name ? { name } : {}),
          ...(updates.statId !== undefined ? { statId: updates.statId } : {}),
        };
      });
      setCategories(updated);
      if (useSupabase && userId) {
        await saveCategoriesSupabase(userId, updated);
      } else {
        saveCategories(updated);
      }
    },
    [categories, useSupabase, userId]
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      if (id === UNCATEGORIZED_ID) return;
      if (useSupabase && userId) {
        const habits = await loadHabitsSupabase(userId);
        const updatedHabits = habits.map((h) =>
          h.categoryId === id ? { ...h, categoryId: UNCATEGORIZED_ID } : h
        );
        await saveHabitsSupabase(userId, updatedHabits);
      } else {
        const habits = loadHabits();
        const updatedHabits = habits.map((h) =>
          h.categoryId === id ? { ...h, categoryId: UNCATEGORIZED_ID } : h
        );
        saveHabits(updatedHabits);
      }
      const updated = categories.filter((c) => c.id !== id);
      setCategories(updated);
      if (useSupabase && userId) {
        await saveCategoriesSupabase(userId, updated);
      } else {
        saveCategories(updated);
      }
    },
    [categories, useSupabase, userId]
  );

  return { categories, loading, addCategory, updateCategory, deleteCategory };
}
