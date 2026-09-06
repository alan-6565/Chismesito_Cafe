import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { available } = (await req.json()) as { available?: boolean };

  if (typeof available !== "boolean") {
    return NextResponse.json({ error: "Missing available" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("menu_items").update({ available }).eq("id", id);
  if (error) return NextResponse.json({ error: "Could not update item" }, { status: 500 });

  return NextResponse.json({ ok: true });
}
