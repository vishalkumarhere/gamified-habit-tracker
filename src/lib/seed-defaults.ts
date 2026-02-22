/**
 * Server-only: Seed default categories and RPG stats for new users.
 * Used by the auth callback route after first sign-in.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { RpgStat } from "./types";

export const UNCATEGORIZED_ID = "uncategorized";

const DEFAULT_RPG_STATS: RpgStat[] = [
  { id: "strength", name: "Strength" },
  { id: "agility", name: "Agility" },
  { id: "weaponMastery", name: "Weapon M." },
  { id: "cursedResistance", name: "Cursed R." },
];

export async function seedDefaultsForNewUser(
  userId: string,
  supabase: SupabaseClient
): Promise<void> {
  const { data: existingCategories } = await supabase
    .from("categories")
    .select("id")
    .eq("user_id", userId)
    .limit(1);
  if (!existingCategories?.length) {
    await supabase.from("categories").insert({
      id: UNCATEGORIZED_ID,
      user_id: userId,
      name: "Uncategorized",
    });
  }

  const { data: existingRpgStats } = await supabase
    .from("rpg_stats")
    .select("id")
    .eq("user_id", userId)
    .limit(1);
  if (!existingRpgStats?.length) {
    await supabase.from("rpg_stats").insert(
      DEFAULT_RPG_STATS.map((s) => ({
        id: s.id,
        user_id: userId,
        name: s.name,
      }))
    );
  }

  const { data: existingUserData } = await supabase
    .from("user_data")
    .select("user_id")
    .eq("user_id", userId)
    .single();
  if (!existingUserData) {
    await supabase.from("user_data").insert({
      user_id: userId,
      xp_by_date: {},
    });
  }
}
