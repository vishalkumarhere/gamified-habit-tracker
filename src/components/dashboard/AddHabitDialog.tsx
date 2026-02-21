"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCategories } from "@/hooks/useCategories";
import type { Category, HabitType, Difficulty } from "@/lib/types";
import { Plus } from "lucide-react";
import { UNCATEGORIZED_ID } from "@/lib/storage";

interface AddHabitDialogProps {
  onAdd: (
    title: string,
    type: HabitType,
    categoryId: string,
    targetReps: number,
    difficulty?: Difficulty,
    weight?: number
  ) => void;
  categories?: Category[];
}

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
  { value: "brutal", label: "Brutal" },
];

export function AddHabitDialog({ onAdd, categories: categoriesProp }: AddHabitDialogProps) {
  const fallbackCategories = useCategories().categories;
  const categories = categoriesProp ?? fallbackCategories;
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<HabitType>("good");
  const [categoryId, setCategoryId] = useState(UNCATEGORIZED_ID);
  const [targetReps, setTargetReps] = useState(1);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [weight, setWeight] = useState(1);

  const handleAdd = () => {
    if (title.trim()) {
      onAdd(
        title.trim(),
        type,
        categoryId,
        Math.max(1, targetReps),
        difficulty,
        Math.max(0.8, Math.min(1.5, weight))
      );
      setTitle("");
      setType("good");
      setCategoryId(UNCATEGORIZED_ID);
      setTargetReps(1);
      setDifficulty("medium");
      setWeight(1);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-[#0FA958] hover:bg-[#0d9650] text-white">
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#0A0A0A] border-[#1F1F1F]">
        <DialogHeader>
          <DialogTitle>Add Habit</DialogTitle>
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
                  type === "bad"
                    ? ""
                    : "border-[#1F1F1F] hover:bg-[#1A1A1A]"
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
              Target repetitions {type === "bad" ? "(per day)" : ""}
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
            onClick={handleAdd}
            className="w-full bg-[#0FA958] hover:bg-[#0d9650]"
          >
            Add habit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
