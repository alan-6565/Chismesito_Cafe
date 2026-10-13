import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { findGiftCard } from "@/lib/gift-cards";

export async function GET(req: NextRequest) {
  const card = await findGiftCard(req.nextUrl.searchParams.get("code") ?? "");
  if (!card) return NextResponse.json({ error: "No gift card with that code" }, { status: 404 });

  const { data: history } = await supabaseAdmin
    .from("gift_card_redemptions")
    .select("amount, source, created_at")
    .eq("gift_card_id", card.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return NextResponse.json({ card, history: history ?? [] });
}
