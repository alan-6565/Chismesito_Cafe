import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const VALID_STATUSES = ["pending", "preparing", "ready", "completed", "cancelled"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { fulfillmentStatus } = await req.json();

  if (!VALID_STATUSES.includes(fulfillmentStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("orders")
    .update({ fulfillment_status: fulfillmentStatus })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Could not update order" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
