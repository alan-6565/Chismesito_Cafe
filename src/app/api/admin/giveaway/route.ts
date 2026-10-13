import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { giveawayMonth } from "@/lib/giveaway";

export async function GET(req: NextRequest) {
  const current = giveawayMonth();
  const month = req.nextUrl.searchParams.get("month") || current;

  const [{ data: entries, error }, { data: monthRows }] = await Promise.all([
    supabaseAdmin
      .from("giveaway_entries")
      .select("id, name, email, email_normalized, phone, source, order_id, created_at, prize, won_at, gift_cards(code)")
      .eq("month", month)
      .order("created_at", { ascending: false }),
    supabaseAdmin.from("giveaway_entries").select("month"),
  ]);
  if (error) return NextResponse.json({ error: "Could not load entries" }, { status: 500 });

  const months = [...new Set([current, ...(monthRows ?? []).map((r) => r.month as string)])].sort().reverse();
  return NextResponse.json({ month, currentMonth: current, months, entries });
}
