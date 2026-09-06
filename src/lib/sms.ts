import "server-only";
import { supabaseAdmin } from "./supabase";
import { formatCents } from "./money";

// Twilio's REST API is a plain authenticated POST — not worth pulling in
// their SDK for one call. Sends via fetch directly.
const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER;
const STAFF_PHONE_NUMBER = process.env.STAFF_PHONE_NUMBER;

/**
 * Texts the staff phone when a new order actually needs attention (paid
 * online, or pay-at-pickup which is actionable immediately). Guarded by
 * staff_sms_sent_at so the webhook and the confirmation-page fallback can't
 * both fire a duplicate text for the same order.
 */
export async function notifyStaffOfNewOrder(orderId: string): Promise<void> {
  if (!TWILIO_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER || !STAFF_PHONE_NUMBER) return;

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("id, customer_name, payment_method, total_cents, staff_sms_sent_at")
    .eq("id", orderId)
    .single();

  if (!order || order.staff_sms_sent_at) return;

  const { count: itemCount } = await supabaseAdmin
    .from("order_items")
    .select("id", { count: "exact", head: true })
    .eq("order_id", orderId);

  const payLine = order.payment_method === "online" ? "Paid online" : "Pay at pickup";
  const body = `Chismesito: New order from ${order.customer_name} — ${itemCount ?? "?"} item(s), ${formatCents(order.total_cents)}. ${payLine}.`;

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${TWILIO_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      To: STAFF_PHONE_NUMBER,
      From: TWILIO_FROM_NUMBER,
      Body: body,
    }),
  });

  if (res.ok) {
    await supabaseAdmin
      .from("orders")
      .update({ staff_sms_sent_at: new Date().toISOString() })
      .eq("id", orderId);
  }
}
