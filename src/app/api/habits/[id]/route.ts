import { NextResponse } from "next/server";
import type { Habit } from "@/lib/types";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  // Placeholder - client uses localStorage
  return NextResponse.json({ id, updated: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  // Placeholder - client uses localStorage
  return NextResponse.json({ id, deleted: true });
}
