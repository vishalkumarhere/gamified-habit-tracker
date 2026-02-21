"use client";

import { useState } from "react";
import type { RpgStat } from "@/lib/types";
import { useRpgStats } from "@/hooks/useRpgStats";
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
import { Pencil, Plus, Trash2, Zap } from "lucide-react";

interface RpgStatsManagerProps {
  rpgStats?: RpgStat[];
  addRpgStat?: (name: string) => void;
  updateRpgStat?: (id: string, name: string) => void;
  deleteRpgStat?: (id: string) => void;
}

export function RpgStatsManager({
  rpgStats: rpgStatsProp,
  addRpgStat: addRpgStatProp,
  updateRpgStat: updateRpgStatProp,
  deleteRpgStat: deleteRpgStatProp,
}: RpgStatsManagerProps = {}) {
  const hook = useRpgStats();
  const rpgStats = rpgStatsProp ?? hook.rpgStats;
  const addRpgStat = addRpgStatProp ?? hook.addRpgStat;
  const updateRpgStat = updateRpgStatProp ?? hook.updateRpgStat;
  const deleteRpgStat = deleteRpgStatProp ?? hook.deleteRpgStat;

  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const handleAdd = () => {
    if (newName.trim()) {
      addRpgStat(newName.trim());
      setNewName("");
      setAddOpen(false);
    }
  };

  const startEdit = (stat: RpgStat) => {
    setEditingId(stat.id);
    setEditingName(stat.name);
  };

  const saveEdit = () => {
    if (editingId && editingName.trim()) {
      updateRpgStat(editingId, editingName.trim());
      setEditingId(null);
      setEditingName("");
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete "${name}"? Categories linked to it will be unlinked.`)) {
      deleteRpgStat(id);
    }
  };

  return (
    <Card className="bg-[#0A0A0A] border-[#1F1F1F]">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="h-4 w-4 text-[#0FA958]" />
          RPG Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Stats shown on Dashboard and Stats tab. Categories can link to these.
        </p>
        <ul className="space-y-2">
          {rpgStats.map((stat) => (
            <li
              key={stat.id}
              className="flex items-center justify-between gap-2 py-2 border-b border-[#1F1F1F] last:border-0"
            >
              {editingId === stat.id ? (
                <div className="flex gap-2 flex-1">
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                    className="bg-[#050505] border-[#1F1F1F]"
                    autoFocus
                  />
                  <Button size="sm" onClick={saveEdit}>
                    Save
                  </Button>
                </div>
              ) : (
                <>
                  <span className="font-medium">{stat.name}</span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => startEdit(stat)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(stat.id, stat.name)}
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
              Add RPG stat
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0A0A0A] border-[#1F1F1F]">
            <DialogHeader>
              <DialogTitle>New RPG Stat</DialogTitle>
            </DialogHeader>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. Intelligence"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="bg-[#050505] border-[#1F1F1F]"
              />
              <Button
                onClick={handleAdd}
                className="bg-[#0FA958] hover:bg-[#0d9650]"
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
