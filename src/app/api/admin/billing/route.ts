import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const PER_ITEM_FEE_CENTS = 100; // $1 per item sold through the site

type MonthSummary = { month: string; itemCount: number; orderCount: number; amountOwedCents: number };
type LineItem = { month: string; createdAt: string; name: string; quantity: number };

/**
 * "Sold" = money actually changed hands (paid online) or the customer
 * actually picked it up (fulfillment completed). Excludes pending/
 * cancelled/abandoned orders — those never became a real sale. Shared by
 * GET (to render the dashboard) and POST (to snapshot a month's amount at
 * the moment it's marked paid) so the two can never disagree.
 */
async function getMonthlySummaries(): Promise<{ months: MonthSummary[]; lineItems: LineItem[] } | null> {
  const { data: orders, error: ordersError } = await supabaseAdmin
    .from("orders")
    .select("id, created_at, payment_status, fulfillment_status")
    .or("payment_status.eq.paid,fulfillment_status.eq.completed");

  if (ordersError || !orders) return null;

  const orderIds = orders.map((o) => o.id);
  const { data: items, error: itemsError } = orderIds.length
    ? await supabaseAdmin.from("order_items").select("order_id, name_snapshot, quantity").in("order_id", orderIds)
    : { data: [], error: null };

  if (itemsError) return null;

  const orderById = new Map(orders.map((o) => [o.id, o]));
  const monthKey = (iso: string) => iso.slice(0, 7); // "2026-09"

  const monthly = new Map<string, { itemCount: number; orderIds: Set<string> }>();
  const lineItems: LineItem[] = [];

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

  return { months, lineItems };
}

export async function GET() {
  const summary = await getMonthlySummaries();
  if (!summary) return NextResponse.json({ error: "Could not load orders" }, { status: 500 });

  const { data: payments, error: paymentsError } = await supabaseAdmin
    .from("billing_payments")
    .select("month, paid_at");

  if (paymentsError) return NextResponse.json({ error: "Could not load payments" }, { status: 500 });

  const paidByMonth = new Map((payments ?? []).map((p) => [p.month, p.paid_at]));

  const months = summary.months.map((m) => ({
    ...m,
    paid: paidByMonth.has(m.month),
    paidAt: paidByMonth.get(m.month) ?? null,
  }));

  const totalItemCount = months.reduce((sum, m) => sum + m.itemCount, 0);
  const outstandingAmountCents = months
    .filter((m) => !m.paid)
    .reduce((sum, m) => sum + m.amountOwedCents, 0);

  return NextResponse.json({
    perItemFeeCents: PER_ITEM_FEE_CENTS,
    totalItemCount,
    totalAmountEverOwedCents: totalItemCount * PER_ITEM_FEE_CENTS,
    outstandingAmountCents,
    months,
    lineItems: summary.lineItems.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  });
}

export async function POST(req: NextRequest) {
  const { month } = (await req.json()) as { month?: string };
  if (!month) return NextResponse.json({ error: "Missing month" }, { status: 400 });

  const summary = await getMonthlySummaries();
  if (!summary) return NextResponse.json({ error: "Could not load orders" }, { status: 500 });

  const target = summary.months.find((m) => m.month === month);
  if (!target) return NextResponse.json({ error: "No billable orders in that month" }, { status: 404 });

  const { error } = await supabaseAdmin
    .from("billing_payments")
    .upsert({ month, amount_cents: target.amountOwedCents, paid_at: new Date().toISOString() });

  if (error) return NextResponse.json({ error: "Could not mark month paid" }, { status: 500 });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { month } = (await req.json()) as { month?: string };
  if (!month) return NextResponse.json({ error: "Missing month" }, { status: 400 });

  const { error } = await supabaseAdmin.from("billing_payments").delete().eq("month", month);
  if (error) return NextResponse.json({ error: "Could not unmark month" }, { status: 500 });

  return NextResponse.json({ ok: true });
}
