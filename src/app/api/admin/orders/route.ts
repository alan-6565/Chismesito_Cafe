import { after, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { stripe } from "@/lib/stripe";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { notifyStaffOfNewOrder } from "@/lib/staff-notify";

// Stripe Checkout sessions can't live longer than 24h, so anything older
// that's still pending can never be paid — no need to ask Stripe.
const MAX_SESSION_LIFETIME_MS = 24 * 60 * 60 * 1000;

/**
 * Online orders are saved as "pending" before the customer reaches Stripe.
 * For each one still pending, ask Stripe what happened:
 *  - paid    → mark it paid (covers a customer who paid and closed the tab
 *              before the webhook or confirmation page could record it)
 *  - expired → the customer abandoned checkout, so auto-cancel the order
 */
async function syncPendingOnlinePayments() {
  const { data: pending } = await supabaseAdmin
    .from("orders")
    .select("id, created_at, stripe_session_id")
    .eq("payment_method", "online")
    .eq("payment_status", "pending")
    .neq("fulfillment_status", "cancelled");

  await Promise.all(
    (pending ?? []).map(async (order) => {
      const cancel = () => supabaseAdmin.from("orders").update({ fulfillment_status: "cancelled" }).eq("id", order.id);

      if (!order.stripe_session_id || Date.now() - new Date(order.created_at).getTime() > MAX_SESSION_LIFETIME_MS) {
        await cancel();
        return;
      }
      try {
        const session = await stripe.checkout.sessions.retrieve(order.stripe_session_id);
        if (session.payment_status === "paid") {
          const stripeEmail = session.customer_details?.email;
          await supabaseAdmin
            .from("orders")
            .update({ payment_status: "paid", ...(stripeEmail ? { customer_email: stripeEmail } : {}) })
            .eq("id", order.id);
          after(() => sendOrderConfirmationEmail(order.id));
          after(() => notifyStaffOfNewOrder(order.id));
        } else if (session.status === "expired") {
          await cancel();
        }
      } catch (err) {
        console.error(`[orders] could not check Stripe for order ${order.id}:`, err);
      }
    })
  );
}

export async function GET() {
  await syncPendingOnlinePayments();

  const { data: orders, error: ordersError } = await supabaseAdmin
    .from("orders")
    .select("id, created_at, customer_name, customer_phone, payment_method, payment_status, fulfillment_status, total_cents, staff_notes, pickup_at")
    // An online order that was never paid is an abandoned checkout, not a
    // real order — showing it made staff think customers ordered twice.
    .or("payment_method.eq.pickup,payment_status.eq.paid")
    .order("created_at", { ascending: false })
    .limit(100);

  if (ordersError || !orders) {
    return NextResponse.json({ error: "Could not load orders" }, { status: 500 });
  }

  const { data: items, error: itemsError } = orders.length
    ? await supabaseAdmin
        .from("order_items")
        .select("order_id, name_snapshot, price_cents_snapshot, quantity, size_label, modifiers, notes, menu_items(image_url)")
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
