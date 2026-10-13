import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { CATEGORY_ORDER } from "@/lib/menu-categories";

type ItemPatch = {
  available?: boolean;
  name?: string;
  description?: string;
  category?: string;
  basePriceCents?: number;
  sizes?: { id: string; priceCents: number }[];
};

const validPrice = (cents: unknown) => Number.isInteger(cents) && (cents as number) > 0;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await req.json()) as ItemPatch;

  const update: Record<string, string | number | boolean> = {};
  if (body.available !== undefined) {
    if (typeof body.available !== "boolean") return NextResponse.json({ error: "Invalid availability" }, { status: 400 });
    update.available = body.available;
  }
  if (body.name !== undefined) {
    if (!body.name.trim()) return NextResponse.json({ error: "Name can't be empty" }, { status: 400 });
    update.name = body.name.trim();
  }
  if (body.description !== undefined) update.description = body.description.trim();
  if (body.category !== undefined) {
    if (!CATEGORY_ORDER.includes(body.category)) return NextResponse.json({ error: "Invalid section" }, { status: 400 });
    update.category = body.category;
  }
  if (body.basePriceCents !== undefined) {
    if (!validPrice(body.basePriceCents)) return NextResponse.json({ error: "Please enter a valid price" }, { status: 400 });
    update.base_price_cents = body.basePriceCents;
  }
  if (body.sizes?.some((s) => !validPrice(s.priceCents))) {
    return NextResponse.json({ error: "Please enter a valid price for every size" }, { status: 400 });
  }
  if (Object.keys(update).length === 0 && !body.sizes?.length) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  if (Object.keys(update).length > 0) {
    const { error } = await supabaseAdmin.from("menu_items").update(update).eq("id", id);
    if (error) return NextResponse.json({ error: "Could not update item" }, { status: 500 });
  }

  // Scoped to this item's own sizes so a size id from another item can't be edited here.
  for (const size of body.sizes ?? []) {
    const { error } = await supabaseAdmin
      .from("menu_item_sizes")
      .update({ price_cents: size.priceCents })
      .eq("id", size.id)
      .eq("menu_item_id", id);
    if (error) return NextResponse.json({ error: "Could not update size prices" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// Sizes and modifier-group links cascade-delete with the item. Past orders
// keep their own name/price/size snapshot regardless, so removing an item
// never touches order history — order_items.menu_item_id just goes null.
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { error } = await supabaseAdmin.from("menu_items").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Could not remove item" }, { status: 500 });

  return NextResponse.json({ ok: true });
}
