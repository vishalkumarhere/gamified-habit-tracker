"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Swords, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestCardProps {
  title: string;
  description: string;
  xpReward: number;
  completed?: boolean;
  progress?: number;
  onToggle?: () => void;
}

export function QuestCard({
  title,
  description,
  xpReward,
  completed = false,
  progress = 0,
  onToggle,
}: QuestCardProps) {
  return (
    <Card
      onClick={onToggle}
      className={cn(
        "bg-[#0A0A0A] border rounded-xl transition-all",
        completed ? "border-[#0FA958]" : "border-[#1F1F1F] hover:border-[#2A2A2A]",
        onToggle && "cursor-pointer"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "p-2 rounded-lg shrink-0",
              completed ? "bg-[#0FA958]/20" : "bg-[#1A1A1A]"
            )}
          >
            <Swords className={cn("h-5 w-5", completed ? "text-[#0FA958]" : "text-muted-foreground")} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3
                className={cn(
                  "font-medium font-[family-name:var(--font-inter-tight)]",
                  completed && "line-through text-muted-foreground"
                )}
              >
                {title}
              </h3>
              <Badge variant="secondary" className="bg-[#1A1A1A] text-[#0FA958]">
                <Trophy className="h-3 w-3 mr-1" />
                +{xpReward} XP
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
            {!completed && progress > 0 && (
              <div className="mt-2 h-1 rounded-full bg-[#1A1A1A] overflow-hidden">
                <div
                  className="h-full bg-[#0FA958] rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
