import "server-only";
import { supabaseAdmin } from "@/lib/supabase";

// Staff can pause online orders for a short time (never more than an hour)
// from the Orders page. It turns itself back on when the time runs out, so a
// forgotten pause can't keep the shop offline.

export const MAX_PAUSE_MINUTES = 60;
const KEY = "ordering_paused_until";

/** When ordering comes back, or null if it's on */
export async function pausedUntil(): Promise<string | null> {
  const { data, error } = await supabaseAdmin.from("site_settings").select("value").eq("key", KEY).maybeSingle();
  if (error) throw error;
  const until = typeof data?.value === "string" ? data.value : null;
  return until && Date.parse(until) > Date.now() ? until : null;
}

/** Pause for `minutes` (1–60) from now, or resume with 0 */
export async function setPause(minutes: number): Promise<string | null> {
  const m = Math.min(MAX_PAUSE_MINUTES, Math.max(0, Math.round(minutes)));
  const until = m > 0 ? new Date(Date.now() + m * 60_000).toISOString() : null;
  const { error } = await supabaseAdmin.from("site_settings").upsert({ key: KEY, value: until, updated_at: new Date().toISOString() });
  if (error) throw error;
  return until;
}
