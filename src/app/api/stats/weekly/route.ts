import { NextResponse } from "next/server";

// Placeholder - Stats tab reads from localStorage via useWeeklyStats hook
export async function GET() {
  return NextResponse.json({
    daily: [],
    habits: [],
    streakDays: [],
  });
}
