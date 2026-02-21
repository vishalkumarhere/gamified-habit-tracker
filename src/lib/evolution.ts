import type { Habit } from "./types";

export const AVATAR_IMAGES: Record<1 | 2 | 3 | 4, string> = {
  1: "/avatars/stage-1-shadow.png",
  2: "/avatars/stage-2-partial.svg",
  3: "/avatars/stage-3-assassin.svg",
  4: "/avatars/stage-4-heavenly.svg",
};

export const STAGE_LABELS: Record<1 | 2 | 3 | 4, string> = {
  1: "Shadow Form",
  2: "Partial Reveal",
  3: "Assassin Mode",
  4: "Heavenly Restriction Mode",
};

export function getAvatarStage(completion: number): 1 | 2 | 3 | 4 {
  if (completion >= 100) return 4;
  if (completion >= 70) return 3;
  if (completion >= 30) return 2;
  return 1;
}

export function getAvatarImageUrl(stage: 1 | 2 | 3 | 4): string {
  return AVATAR_IMAGES[stage];
}
