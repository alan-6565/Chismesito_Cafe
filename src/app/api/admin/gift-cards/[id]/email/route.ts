import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendGiftCardEmail } from "@/lib/email";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: card } = await supabaseAdmin.from("gift_cards").select("*").eq("id", id).single();
  if (!card?.recipient_email) return NextResponse.json({ error: "This card has no email" }, { status: 400 });

  if (!(await sendGiftCardEmail(card))) {
    return NextResponse.json({ error: "Could not send the email" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
