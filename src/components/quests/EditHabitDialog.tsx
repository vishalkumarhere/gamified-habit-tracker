"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Category, Habit, HabitType, Difficulty } from "@/lib/types";
import { UNCATEGORIZED_ID } from "@/lib/storage";

interface EditHabitDialogProps {
  habit: Habit | null;
  categories: Category[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (
    id: string,
    updates: {
      title: string;
      type: HabitType;
      categoryId: string;
      targetReps: number;
      difficulty?: Difficulty;
      weight?: number;
    }
  ) => void;
}

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
  { value: "brutal", label: "Brutal" },
];

export function EditHabitDialog({
  habit,
  categories,
  open,
  onOpenChange,
  onSave,
}: EditHabitDialogProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<HabitType>("good");
  const [categoryId, setCategoryId] = useState(UNCATEGORIZED_ID);
  const [targetReps, setTargetReps] = useState(1);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [weight, setWeight] = useState(1);

  useEffect(() => {
    if (habit) {
      setTitle(habit.title);
      setType(habit.type);
      setCategoryId(habit.categoryId);
      setTargetReps(habit.targetReps);
      setDifficulty(habit.difficulty ?? "medium");
      setWeight(habit.weight ?? 1);
    }
  }, [habit]);

  const handleSave = () => {
    if (habit && title.trim()) {
      onSave(habit.id, {
        title: title.trim(),
        type,
        categoryId,
        targetReps: Math.max(1, targetReps),
        difficulty,
        weight: Math.max(0.8, Math.min(1.5, weight)),
      });
      onOpenChange(false);
    }
  };

  if (!habit) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0A0A0A] border-[#1F1F1F]">
        <DialogHeader>
          <DialogTitle>Edit habit</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground block mb-1">
              Title
            </label>
            <Input
              placeholder="Habit title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-[#050505] border-[#1F1F1F]"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-1">
              Type
            </label>
            <div className="flex gap-2">
              <Button
                variant={type === "good" ? "default" : "outline"}
                size="sm"
                className={
                  type === "good"
                    ? "bg-[#0FA958] hover:bg-[#0d9650]"
                    : "border-[#1F1F1F]"
                }
                onClick={() => setType("good")}
              >
                Good
              </Button>
              <Button
                variant={type === "bad" ? "destructive" : "outline"}
                size="sm"
                className={
                  type === "bad" ? "" : "border-[#1F1F1F] hover:bg-[#1A1A1A]"
                }
                onClick={() => setType("bad")}
              >
                Bad
              </Button>
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-1">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#050505] border border-[#1F1F1F] text-foreground"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-1">
              Target repetitions
            </label>
            <Input
              type="number"
              min={1}
              value={targetReps}
              onChange={(e) =>
                setTargetReps(Math.max(1, parseInt(e.target.value, 10) || 1))
              }
              className="bg-[#050505] border-[#1F1F1F]"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-1">
              Difficulty (XP multiplier)
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              className="w-full px-3 py-2 rounded-lg bg-[#050505] border border-[#1F1F1F] text-foreground"
            >
              {DIFFICULTY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-1">
              Weight (0.8–1.5 importance)
            </label>
            <Input
              type="number"
              min={0.8}
              max={1.5}
              step={0.1}
              value={weight}
              onChange={(e) =>
                setWeight(Math.max(0.8, Math.min(1.5, parseFloat(e.target.value) || 1)))
              }
              className="bg-[#050505] border-[#1F1F1F]"
            />
          </div>
          <Button
            onClick={handleSave}
            className="w-full bg-[#0FA958] hover:bg-[#0d9650]"
          >
            Save changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
