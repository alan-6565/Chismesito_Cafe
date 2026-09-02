import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const { data: orders, error: ordersError } = await supabaseAdmin
    .from("orders")
    .select("id, created_at, customer_name, customer_phone, payment_method, payment_status, fulfillment_status, total_cents")
    .order("created_at", { ascending: false })
    .limit(100);

  if (ordersError || !orders) {
    return NextResponse.json({ error: "Could not load orders" }, { status: 500 });
  }

  const { data: items, error: itemsError } = orders.length
    ? await supabaseAdmin
        .from("order_items")
        .select("order_id, name_snapshot, price_cents_snapshot, quantity, size_label, modifiers")
        .in("order_id", orders.map((o) => o.id))
    : { data: [], error: null };

  if (itemsError) {
    return NextResponse.json({ error: "Could not load order items" }, { status: 500 });
  }

  const itemsByOrder = new Map<string, typeof items>();
  for (const item of items ?? []) {
    const list = itemsByOrder.get(item.order_id) ?? [];
    list.push(item);
    itemsByOrder.set(item.order_id, list);
  }

  return NextResponse.json({
    orders: orders.map((o) => ({ ...o, items: itemsByOrder.get(o.id) ?? [] })),
  });
}
