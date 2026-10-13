import { randomInt } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createGiftCard } from "@/lib/gift-cards";
import { sendGiftCardEmail } from "@/lib/email";
import { GIVEAWAY_PRIZES } from "@/lib/giveaway";

/**
 * Picks one random winning entry per prize from a month's entries — so more
 * entries means better odds — but a person can only win once. Each winner
 * gets a gift card for their prize by email.
 */
export async function POST(req: NextRequest) {
  const { month } = (await req.json()) as { month?: string };
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: "Missing month" }, { status: 400 });
  }

  const { data: entries, error } = await supabaseAdmin
    .from("giveaway_entries")
    .select("id, name, email, email_normalized, won_at")
    .eq("month", month);
  if (error || !entries) return NextResponse.json({ error: "Could not load entries" }, { status: 500 });
  if (entries.some((e) => e.won_at)) {
    return NextResponse.json({ error: "Winners were already picked for this month" }, { status: 409 });
  }
  if (new Set(entries.map((e) => e.email_normalized)).size < GIVEAWAY_PRIZES.length) {
    return NextResponse.json(
      { error: `Need at least ${GIVEAWAY_PRIZES.length} different people entered to pick winners` },
      { status: 400 }
    );
  }

  let pool = [...entries];
  const winners: { name: string; prize: string; emailed: boolean }[] = [];

  for (const prize of GIVEAWAY_PRIZES) {
    const winner = pool[randomInt(pool.length)];
    pool = pool.filter((e) => e.email_normalized !== winner.email_normalized);
    const card = await createGiftCard({
      kind: prize.kind,
      value: prize.value,
      recipientName: winner.name,
      recipientEmail: winner.email,
      note: `Giveaway winner — ${month}`,
    });
    if (!card) return NextResponse.json({ error: "Could not create the prize gift card" }, { status: 500 });

    await supabaseAdmin
      .from("giveaway_entries")
      .update({ prize: prize.title, gift_card_id: card.id, won_at: new Date().toISOString() })
      .eq("id", winner.id);

    const emailed = await sendGiftCardEmail(card, prize.title);
    winners.push({ name: winner.name, prize: prize.title, emailed });
  }

  return NextResponse.json({ winners });
}
