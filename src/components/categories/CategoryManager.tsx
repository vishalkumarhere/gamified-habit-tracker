"use client";

import { useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import type { Category, RpgStat } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { UNCATEGORIZED_ID } from "@/lib/storage";

interface CategoryManagerProps {
  categories?: Category[];
  rpgStats?: RpgStat[];
  addCategory?: (name: string, statId?: string) => void;
  updateCategory?: (id: string, updates: { name?: string; statId?: string }) => void;
  deleteCategory?: (id: string) => void;
}

export function CategoryManager({
  categories: categoriesProp,
  rpgStats = [],
  addCategory: addCategoryProp,
  updateCategory: updateCategoryProp,
  deleteCategory: deleteCategoryProp,
}: CategoryManagerProps = {}) {
  const hook = useCategories();
  const categories = categoriesProp ?? hook.categories;
  const addCategory = addCategoryProp ?? hook.addCategory;
  const updateCategory = updateCategoryProp ?? hook.updateCategory;
  const deleteCategory = deleteCategoryProp ?? hook.deleteCategory;

  const [newName, setNewName] = useState("");
  const [newStatId, setNewStatId] = useState<string | undefined>(undefined);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingStatId, setEditingStatId] = useState<string | undefined>(undefined);
  const [addOpen, setAddOpen] = useState(false);

  const handleAdd = () => {
    if (newName.trim()) {
      addCategory(newName.trim(), newStatId);
      setNewName("");
      setNewStatId(undefined);
      setAddOpen(false);
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
    setEditingStatId(cat.statId);
  };

  const saveEdit = () => {
    if (editingId && editingName.trim()) {
      updateCategory(editingId, { name: editingName.trim(), statId: editingStatId });
      setEditingId(null);
      setEditingName("");
      setEditingStatId(undefined);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete "${name}"? Habits will move to Uncategorized.`)) {
      deleteCategory(id);
    }
  };

  const customCategories = categories.filter((c) => c.id !== UNCATEGORIZED_ID);

  return (
    <Card className="bg-[#0A0A0A] border-[#1F1F1F]">
      <CardHeader>
        <CardTitle className="text-base">Categories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="space-y-2">
          {customCategories.map((cat) => (
            <li
              key={cat.id}
              className="flex items-center justify-between gap-2 py-2 border-b border-[#1F1F1F] last:border-0"
            >
              {editingId === cat.id ? (
                <div className="flex flex-col gap-2 flex-1">
                  <div className="flex gap-2">
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                      className="bg-[#050505] border-[#1F1F1F]"
                      autoFocus
                    />
                    <select
                      value={editingStatId ?? ""}
                      onChange={(e) =>
                        setEditingStatId(e.target.value || undefined)
                      }
                      className="px-2 py-1.5 rounded bg-[#050505] border border-[#1F1F1F] text-sm"
                    >
                      <option value="">No stat</option>
                      {rpgStats.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button size="sm" onClick={saveEdit}>
                    Save
                  </Button>
                </div>
              ) : (
                <>
                  <div>
                    <span className="font-medium">{cat.name}</span>
                    {cat.statId && (
                      <span className="text-xs text-muted-foreground ml-2">
                        → {rpgStats.find((s) => s.id === cat.statId)?.name}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => startEdit(cat)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(cat.id, cat.name)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-[#1F1F1F] hover:bg-[#1A1A1A]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add category
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0A0A0A] border-[#1F1F1F]">
            <DialogHeader>
              <DialogTitle>New Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  Name
                </label>
                <Input
                  placeholder="Category name..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  className="bg-[#050505] border-[#1F1F1F]"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  Links to RPG stat
                </label>
                <select
                  value={newStatId ?? ""}
                  onChange={(e) =>
                    setNewStatId(e.target.value || undefined)
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#050505] border border-[#1F1F1F] text-foreground"
                >
                  <option value="">None</option>
                  {rpgStats.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                onClick={handleAdd}
                className="w-full bg-[#0FA958] hover:bg-[#0d9650]"
              >
                Add
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
