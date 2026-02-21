import { NextResponse } from "next/server";
import type { Habit } from "@/lib/types";

// API routes for habits - client uses localStorage directly for now.
// These routes provide a consistent interface for future Supabase migration.
// For localStorage, the client reads/writes via hooks. These are placeholder
// for when we add server-side persistence.

export async function GET() {
  return NextResponse.json({ habits: [] });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { title, icon = "sword" } = body as { title?: string; icon?: string };
  if (!title || typeof title !== "string") {
    return NextResponse.json(
      { error: "title is required" },
      { status: 400 }
    );
  }
  const habit: Habit = {
    id: crypto.randomUUID(),
    title,
    icon,
    type: "good",
    categoryId: "uncategorized",
    targetReps: 1,
    currentReps: 0,
    completed: false,
    progress: 0,
  };
  return NextResponse.json({ habit });
}
