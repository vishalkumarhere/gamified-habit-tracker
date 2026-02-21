"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AvatarStage } from "@/components/AvatarStage";
import { loadUserData, saveUserData } from "@/lib/storage-supabase";
import { useUser, useSupabaseEnabled } from "@/hooks/useUser";

const LAST_WEEK_KEY = "assassin-last-week-seen";

function getWeekId(date: Date): string {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  return start.toISOString().slice(0, 10);
}

export function WeeklyEvolutionModal() {
  const [open, setOpen] = useState(false);
  const { user } = useUser();
  const useSupabase = useSupabaseEnabled() && !!user;
  const userId = user?.id ?? "";

  useEffect(() => {
    const now = new Date();
    const currentWeek = getWeekId(now);
    const isSunday = now.getDay() === 0;
    const isStartOfWeek = now.getDay() === 1; // Monday

    async function checkAndShow() {
      if (useSupabase && userId) {
        const userData = await loadUserData(userId);
        const lastSeen = userData.lastWeekSeen;

        if (lastSeen !== currentWeek && (isSunday || isStartOfWeek || !lastSeen)) {
          setOpen(true);
          await saveUserData(userId, { lastWeekSeen: currentWeek });
        }
      } else if (typeof window !== "undefined") {
        const lastSeen = localStorage.getItem(LAST_WEEK_KEY);

        if (lastSeen !== currentWeek && (isSunday || isStartOfWeek || !lastSeen)) {
          setOpen(true);
          localStorage.setItem(LAST_WEEK_KEY, currentWeek);
        }
      }
    }

    checkAndShow();
  }, [useSupabase, userId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-[#0A0A0A] border-[#1F1F1F] max-w-md">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-inter-tight)]">
            Weekly Evolution
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-6 py-4">
          <AvatarStage stage={4} className="w-24 h-24" />
          <p className="text-center text-muted-foreground text-sm">
            Your assassin has ascended. Continue your quests to unlock greater power.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
