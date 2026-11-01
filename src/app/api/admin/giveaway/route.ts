import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { giveawayMonth } from "@/lib/giveaway";

export async function GET(req: NextRequest) {
  const current = giveawayMonth();
  const month = req.nextUrl.searchParams.get("month") || (await monthToDraw()) || current;

  const [{ data: entries, error }, { data: monthRows }, { data: prizeCards }] = await Promise.all([
    supabaseAdmin
      .from("giveaway_entries")
      .select("id, name, email, email_normalized, phone, source, order_id, created_at, prize, won_at")
      .eq("month", month)
      .order("created_at", { ascending: false }),
    supabaseAdmin.from("giveaway_entries").select("month"),
    supabaseAdmin
      .from("gift_cards")
      .select("code, kind, initial_value, balance, emailed_at")
      .eq("note", `Giveaway winner — ${month}`)
      .order("created_at"),
  ]);
  if (error) return NextResponse.json({ error: "Could not load entries" }, { status: 500 });

  const months = [...new Set([current, ...(monthRows ?? []).map((r) => r.month as string)])].sort().reverse();
  return NextResponse.json({ month, currentMonth: current, months, entries, prizeCards: prizeCards ?? [] });
}

/** Last month, if it has entries but no winner yet — the draw that's due. */
async function monthToDraw(): Promise<string | null> {
  const [y, m] = giveawayMonth().split("-").map(Number);
  const previous = m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`;
  const { data } = await supabaseAdmin.from("giveaway_entries").select("won_at").eq("month", previous);
  if (!data?.length || data.some((e) => e.won_at)) return null;
  return previous;
}
