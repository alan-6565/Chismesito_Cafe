import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const VALID_STATUSES = ["pending", "preparing", "ready", "completed", "cancelled"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { fulfillmentStatus, staffNotes } = (await req.json()) as {
    fulfillmentStatus?: string;
    staffNotes?: string;
  };

  const update: Record<string, string> = {};

  if (fulfillmentStatus !== undefined) {
    if (!VALID_STATUSES.includes(fulfillmentStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    update.fulfillment_status = fulfillmentStatus;
  }

  if (staffNotes !== undefined) {
    update.staff_notes = staffNotes.trim();
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("orders").update(update).eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Could not update order" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
