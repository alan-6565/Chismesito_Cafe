import "server-only";
import { resend, FROM_ADDRESS } from "./email";
import { supabaseAdmin } from "./supabase";
import { formatCents } from "./money";
import { formatOrderStamp, formatPickupTime } from "./hours";

const STAFF_EMAIL = process.env.STAFF_EMAIL;

/**
 * Emails the staff inbox when a new order actually needs attention (paid
 * online, or pay-at-pickup which is actionable immediately). Guarded by
 * staff_notified_at so the webhook and the confirmation-page fallback can't
 * both fire a duplicate for the same order.
 */
export async function notifyStaffOfNewOrder(orderId: string): Promise<void> {
  if (!resend || !STAFF_EMAIL) {
    console.error("[email] staff notification skipped: RESEND_API_KEY or STAFF_EMAIL not set");
    return;
  }

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("id, created_at, customer_name, payment_method, total_cents, gift_card_cents, pickup_at, staff_notified_at")
    .eq("id", orderId)
    .single();

  if (!order || order.staff_notified_at) return;

  const { count: itemCount } = await supabaseAdmin
    .from("order_items")
    .select("id", { count: "exact", head: true })
    .eq("order_id", orderId);

  const payLine =
    order.payment_method !== "online"
      ? "Pay at pickup"
      : order.gift_card_cents > 0
        ? `Paid online (${formatCents(order.gift_card_cents)} by gift card)`
        : "Paid online";
  const pickupLine = order.pickup_at ? formatPickupTime(order.pickup_at) : "ASAP";

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: STAFF_EMAIL,
    subject: `New order — ${order.customer_name} (${formatCents(order.total_cents)})`,
    html: `<p>New order from <strong>${order.customer_name}</strong> — ${itemCount ?? "?"} item(s), ${formatCents(order.total_cents)}. ${payLine}.</p><p><strong>Pickup: ${pickupLine}</strong></p><p>Order #${order.id.slice(0, 8)} &middot; placed ${formatOrderStamp(order.created_at)}</p>`,
  });

  if (error) {
    console.error(`[email] send failed for order ${orderId}:`, error);
  } else {
    await supabaseAdmin
      .from("orders")
      .update({ staff_notified_at: new Date().toISOString() })
      .eq("id", orderId);
  }
}

// Repeat reminders for paid orders nobody has accepted yet. A Supabase timer
// calls /api/cron/reminders every 30 seconds; each call emails once per
// waiting order, until it's accepted or this many minutes have passed.
const FIRST_REMINDER_SECONDS = 25;
const STOP_AFTER_MINUTES = 20;

export async function remindStaffOfWaitingOrders(): Promise<number> {
  if (!resend || !STAFF_EMAIL) {
    console.error("[email] staff reminders skipped: RESEND_API_KEY or STAFF_EMAIL not set");
    return 0;
  }

  const now = Date.now();
  const { data: orders, error } = await supabaseAdmin
    .from("orders")
    .select("id, customer_name, total_cents, pickup_at, paid_at")
    .eq("payment_status", "paid")
    .eq("fulfillment_status", "pending")
    .lte("paid_at", new Date(now - FIRST_REMINDER_SECONDS * 1000).toISOString())
    .gte("paid_at", new Date(now - STOP_AFTER_MINUTES * 60 * 1000).toISOString())
    .order("paid_at");
  if (error) throw error;

  for (const order of orders ?? []) {
    const seconds = Math.round((now - new Date(order.paid_at).getTime()) / 30_000) * 30;
    const waited = seconds < 60 ? `${seconds} sec` : `${Math.floor(seconds / 60)}${seconds % 60 ? "½" : ""} min`;
    const pickupLine = order.pickup_at ? formatPickupTime(order.pickup_at) : "ASAP";

    // The wait time is in the subject so each reminder is a new email, not a
    // silent addition to the first one's thread.
    const { error: sendError } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: STAFF_EMAIL,
      subject: `⏰ Order still waiting (${waited}) — ${order.customer_name}`,
      html: `<p><strong>${order.customer_name}</strong>'s order (${formatCents(order.total_cents)}) has been waiting ${waited}. Open the orders screen and tap <strong>Accept Order</strong> to stop these reminders.</p><p><strong>Pickup: ${pickupLine}</strong></p><p>Order #${order.id.slice(0, 8)}</p>`,
    });
    if (sendError) console.error(`[email] reminder failed for order ${order.id}:`, sendError);
  }
  return orders?.length ?? 0;
}
