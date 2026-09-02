import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const PER_ITEM_FEE_CENTS = 100; // $1 per item sold through the site

export async function GET() {
  // "Sold" = money actually changed hands (paid online) or the customer
  // actually picked it up (fulfillment completed). Excludes pending/
  // cancelled/abandoned orders — those never became a real sale.
  const { data: orders, error: ordersError } = await supabaseAdmin
    .from("orders")
    .select("id, created_at, payment_status, fulfillment_status")
    .or("payment_status.eq.paid,fulfillment_status.eq.completed");

  if (ordersError || !orders) {
    return NextResponse.json({ error: "Could not load orders" }, { status: 500 });
  }

  const orderIds = orders.map((o) => o.id);
  const { data: items, error: itemsError } = orderIds.length
    ? await supabaseAdmin
        .from("order_items")
        .select("order_id, name_snapshot, quantity")
        .in("order_id", orderIds)
    : { data: [], error: null };

  if (itemsError) {
    return NextResponse.json({ error: "Could not load order items" }, { status: 500 });
  }

  const orderById = new Map(orders.map((o) => [o.id, o]));
  const monthKey = (iso: string) => iso.slice(0, 7); // "2026-09"

  const monthly = new Map<string, { itemCount: number; orderIds: Set<string> }>();
  const lineItems: { month: string; createdAt: string; name: string; quantity: number }[] = [];

  for (const item of items ?? []) {
    const order = orderById.get(item.order_id);
    if (!order) continue;
    const month = monthKey(order.created_at);

    const bucket = monthly.get(month) ?? { itemCount: 0, orderIds: new Set<string>() };
    bucket.itemCount += item.quantity;
    bucket.orderIds.add(order.id);
    monthly.set(month, bucket);

    lineItems.push({ month, createdAt: order.created_at, name: item.name_snapshot, quantity: item.quantity });
  }

  const months = [...monthly.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([month, bucket]) => ({
      month,
      itemCount: bucket.itemCount,
      orderCount: bucket.orderIds.size,
      amountOwedCents: bucket.itemCount * PER_ITEM_FEE_CENTS,
    }));

  const totalItemCount = months.reduce((sum, m) => sum + m.itemCount, 0);

  return NextResponse.json({
    perItemFeeCents: PER_ITEM_FEE_CENTS,
    totalItemCount,
    totalAmountOwedCents: totalItemCount * PER_ITEM_FEE_CENTS,
    months,
    lineItems: lineItems.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  });
}
