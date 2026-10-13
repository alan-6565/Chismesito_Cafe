import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createGiftCard, type GiftCardKind } from "@/lib/gift-cards";
import { sendGiftCardEmail } from "@/lib/email";
import { isValidEmail } from "@/lib/giveaway";

const MAX_AMOUNT_CENTS = 500_00;
const MAX_DRINKS = 20;

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("gift_cards")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) return NextResponse.json({ error: "Could not load gift cards" }, { status: 500 });
  return NextResponse.json({ cards: data });
}

export async function POST(req: NextRequest) {
  const { kind, value, recipientName, recipientEmail, note } = (await req.json()) as {
    kind?: GiftCardKind;
    value?: number;
    recipientName?: string;
    recipientEmail?: string;
    note?: string;
  };

  if (kind !== "amount" && kind !== "drinks") {
    return NextResponse.json({ error: "Pick a gift card type" }, { status: 400 });
  }
  const max = kind === "amount" ? MAX_AMOUNT_CENTS : MAX_DRINKS;
  if (!Number.isInteger(value) || !value || value <= 0 || value > max) {
    return NextResponse.json({ error: "Enter a valid amount" }, { status: 400 });
  }
  if (recipientEmail?.trim() && !isValidEmail(recipientEmail)) {
    return NextResponse.json({ error: "That email doesn't look right" }, { status: 400 });
  }

  const card = await createGiftCard({ kind, value, recipientName, recipientEmail, note });
  if (!card) return NextResponse.json({ error: "Could not create gift card" }, { status: 500 });

  const emailed = card.recipient_email ? await sendGiftCardEmail(card) : false;
  return NextResponse.json({ card, emailed });
}
