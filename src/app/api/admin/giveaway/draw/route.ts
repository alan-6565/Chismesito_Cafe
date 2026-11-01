import { randomInt } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createGiftCard } from "@/lib/gift-cards";
import { sendGiftCardEmail } from "@/lib/email";
import { GIVEAWAY_PRIZES } from "@/lib/giveaway";

/**
 * Draws one random entry from the month — so each extra entry is an extra
 * chance — and gives that person every prize as a gift card by email.
 */
export async function POST(req: NextRequest) {
  const { month } = (await req.json()) as { month?: string };
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: "Missing month" }, { status: 400 });
  }

  const { data: entries, error } = await supabaseAdmin
    .from("giveaway_entries")
    .select("id, name, email, won_at")
    .eq("month", month);
  if (error || !entries) return NextResponse.json({ error: "Could not load entries" }, { status: 500 });
  if (entries.some((e) => e.won_at)) {
    return NextResponse.json({ error: "A winner was already picked for this month" }, { status: 409 });
  }
  if (!entries.length) return NextResponse.json({ error: "No entries this month" }, { status: 400 });

  const winner = entries[randomInt(entries.length)];
  const prizeTitle = GIVEAWAY_PRIZES.map((p) => p.title).join(" + ");

  // Claim the win before making any prizes. The one-winner-per-month index
  // rejects a second claim, so a double tap or two devices can't both win.
  const { error: claimError } = await supabaseAdmin
    .from("giveaway_entries")
    .update({ prize: prizeTitle, won_at: new Date().toISOString() })
    .eq("id", winner.id)
    .is("won_at", null);
  if (claimError?.code === "23505") {
    return NextResponse.json({ error: "A winner was already picked for this month" }, { status: 409 });
  }
  if (claimError) return NextResponse.json({ error: "Could not save the winner" }, { status: 500 });

  const cardIds: string[] = [];
  let emailed = true;

  for (const prize of GIVEAWAY_PRIZES) {
    const card = await createGiftCard({
      kind: prize.kind,
      value: prize.value,
      recipientName: winner.name,
      recipientEmail: winner.email,
      note: `Giveaway winner — ${month}`,
    });
    if (!card) return NextResponse.json({ error: "Could not create the prize gift card" }, { status: 500 });
    cardIds.push(card.id);
    emailed = (await sendGiftCardEmail(card, prize.title)) && emailed;
  }

  await supabaseAdmin.from("giveaway_entries").update({ gift_card_id: cardIds[0] }).eq("id", winner.id);

  return NextResponse.json({ winner: { name: winner.name, emailed } });
}
