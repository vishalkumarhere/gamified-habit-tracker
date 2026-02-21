"use client";

import type { UserStats, Category, RpgStat } from "@/lib/types";
import { Zap, Wind, Sword, Shield, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { UNCATEGORIZED_ID } from "@/lib/storage";

const ICON_BY_NAME: Record<string, React.ElementType> = {
  strength: Zap,
  agility: Wind,
  "weapon m.": Sword,
  "cursed r.": Shield,
};

function statIcon(stat: RpgStat): React.ElementType {
  const key = stat.name.toLowerCase();
  return ICON_BY_NAME[key] ?? Zap;
}

interface StatsPanelProps {
  stats: UserStats;
  categories?: Category[];
  rpgStats?: RpgStat[];
  onResetStats?: () => void;
  className?: string;
}

export function StatsPanel({ stats, categories = [], rpgStats = [], onResetStats, className }: StatsPanelProps) {
  const categoriesByStat = (statId: string) =>
    categories.filter(
      (c) =>
        c.statId === statId ||
        (statId === rpgStats[0]?.id && c.id === UNCATEGORIZED_ID && !c.statId)
    );

  return (
    <div className={cn("space-y-3", className)}>
      {onResetStats && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onResetStats}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset stats
          </button>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
      {rpgStats.map((stat) => {
        const Icon = statIcon(stat);
        const linkedCats = categoriesByStat(stat.id);
        const value = stats[stat.id] ?? 0;
        return (
          <Card
            key={stat.id}
            className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl"
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-[#0FA958] shrink-0" />
                <div className="min-w-0">
                  <p className="font-[family-name:var(--font-jetbrains-mono)] text-sm font-medium text-foreground">
                    {value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.name}</p>
                  {linkedCats.length > 0 && (
                    <p className="text-[10px] text-muted-foreground truncate" title={linkedCats.map((c) => c.name).join(", ")}>
                      from {linkedCats.map((c) => c.name).join(", ")}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
      </div>
    </div>
  );
}
