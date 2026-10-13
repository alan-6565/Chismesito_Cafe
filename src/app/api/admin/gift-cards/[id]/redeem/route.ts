import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { spendGiftCard } from "@/lib/gift-cards";

/** Uses part of a card at the register (in-person order). */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { units } = (await req.json()) as { units?: number };
  if (!Number.isInteger(units) || !units || units <= 0) {
    return NextResponse.json({ error: "Enter how much to use" }, { status: 400 });
  }

  if (!(await spendGiftCard(id, units, "in_store"))) {
    return NextResponse.json({ error: "Not enough left on this card" }, { status: 409 });
  }

  const { data: card } = await supabaseAdmin.from("gift_cards").select("*").eq("id", id).single();
  return NextResponse.json({ card });
}
