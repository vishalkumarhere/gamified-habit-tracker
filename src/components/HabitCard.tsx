"use client";

import { useState, useEffect } from "react";
import type { Habit } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { DailyProgressRing } from "@/components/DailyProgressRing";
import { Sword, Minus, Pencil, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface HabitCardProps {
  habit: Habit;
  categoryName?: string;
  onIncrementRep?: (habit: Habit) => void;
  onToggle?: (habit: Habit) => void;
  onSetReps?: (habit: Habit, reps: number) => void;
  onEdit?: (habit: Habit) => void;
  onDelete?: () => void;
}

const iconMap: Record<string, React.ElementType> = {
  sword: Sword,
  default: Sword,
};

export function HabitCard({
  habit,
  categoryName,
  onIncrementRep,
  onToggle,
  onSetReps,
  onEdit,
  onDelete,
}: HabitCardProps) {
  const Icon = iconMap[habit.icon] ?? iconMap.default;
  const isGood = habit.type === "good";
  const isBad = habit.type === "bad";
  const isCompleted = habit.completed;
  const useSlider = onSetReps != null;
  const showDelete = onDelete != null;
  const showEdit = onEdit != null;
  const sliderMax = isGood ? habit.targetReps : 20;

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete "${habit.title}"?`)) {
      onDelete?.();
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(habit);
  };

  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    if (!celebrating) return;
    const t = setTimeout(() => setCelebrating(false), 1800);
    return () => clearTimeout(t);
  }, [celebrating]);

  const handleSliderChange = (value: number[]) => {
    const reps = value[0] ?? 0;
    onSetReps?.(habit, reps);
    const wasIncomplete = isGood && !habit.completed;
    const nowComplete = isGood && reps >= habit.targetReps;
    if (wasIncomplete && nowComplete) setCelebrating(true);
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden",
        "bg-[#0A0A0A] border rounded-xl transition-all",
        isGood && isCompleted && "border-[#0FA958] ring-1 ring-[#0FA958]/30",
        isGood && !isCompleted && "border-[#1F1F1F]",
        isBad && "border-[#1F1F1F]"
      )}
    >
      {celebrating && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none bg-[#0FA958]/15 backdrop-blur-[1px]"
          aria-hidden
        >
          <div className="flex items-center gap-1.5 animate-in zoom-in-50 duration-300">
            <Check className="h-10 w-10 text-[#0FA958]" strokeWidth={3} />
            <span className="text-2xl">💯</span>
            <span className="text-2xl">🔥</span>
            <span className="text-2xl">✨</span>
          </div>
        </div>
      )}
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
        {(showEdit || showDelete) && (
          <div className="flex gap-1 shrink-0">
            {showEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={handleEditClick}
                title="Edit habit"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {showDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleDeleteClick}
                title="Delete habit"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
        <div className="shrink-0">
          <Icon
            className={cn(
              "h-5 w-5",
              isGood ? "text-[#0FA958]" : "text-destructive"
            )}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p
              className={cn(
                "font-medium",
                isGood && isCompleted && "line-through text-muted-foreground"
              )}
            >
              {habit.title}
            </p>
            {categoryName && (
              <Badge
                variant="secondary"
                className="text-xs bg-[#1A1A1A] text-muted-foreground"
              >
                {categoryName}
              </Badge>
            )}
          </div>
          {isBad && (
            <p className="text-xs text-destructive mt-0.5 flex items-center gap-1">
              <Minus className="h-3 w-3" />
              -10 XP per rep
            </p>
          )}
        </div>
        {useSlider ? (
          <div className="flex items-center gap-3 shrink-0 min-w-0 flex-1">
            <span
              className={cn(
                "text-sm font-[family-name:var(--font-jetbrains-mono)] w-12 shrink-0",
                isGood ? "text-[#0FA958]" : "text-destructive"
              )}
            >
              {isGood
                ? `${habit.currentReps}/${habit.targetReps}`
                : habit.currentReps}
            </span>
            <Slider
              value={[habit.currentReps]}
              onValueChange={handleSliderChange}
              max={sliderMax}
              min={0}
              step={1}
              variant={isBad ? "destructive" : "default"}
              className="flex-1 min-w-0"
            />
          </div>
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={cn(
                "text-sm font-[family-name:var(--font-jetbrains-mono)]",
                isGood ? "text-[#0FA958]" : "text-destructive"
              )}
            >
              {isGood
                ? `${habit.currentReps}/${habit.targetReps}`
                : habit.currentReps}
            </span>
            {isGood && (
              <DailyProgressRing
                value={isCompleted ? 100 : habit.progress}
                size={40}
                strokeWidth={3}
              />
            )}
          </div>
        )}
        </div>
      </CardContent>
    </Card>
  );
}
