import "server-only";
import { after } from "next/server";
import { supabaseAdmin } from "./supabase";
import { sendOrderConfirmationEmail } from "./email";
import { notifyStaffOfNewOrder } from "./staff-notify";
import { refundGiftCard } from "./gift-cards";
import { giveawayDay, giveawayMonth, normalizeEmail } from "./giveaway";

/**
 * Adds a giveaway entry. Each person gets one free entry per month; every
 * paid order adds another (one per order).
 */
export async function addGiveawayEntry(entry: {
  date?: Date;
  name: string;
  email: string;
  phone?: string | null;
  source: "order" | "free";
  orderId?: string | null;
}): Promise<"added" | "already-entered" | "error"> {
  const { error } = await supabaseAdmin.from("giveaway_entries").insert({
    month: giveawayMonth(entry.date),
    entry_date: giveawayDay(entry.date),
    name: entry.name.trim(),
    email: entry.email.trim(),
    email_normalized: normalizeEmail(entry.email),
    phone: entry.phone?.trim() || null,
    source: entry.source,
    order_id: entry.orderId ?? null,
  });
  // Unique indexes enforce one free entry per month and one entry per order.
  if (error?.code === "23505") return "already-entered";
  if (error) {
    console.error("[giveaway] could not add entry:", error);
    return "error";
  }
  return "added";
}

/**
 * The one place an order becomes paid — called by the Stripe webhook, the
 * confirmation page, the admin sync, and gift-card-only checkouts. Only the
 * call that actually flips it runs the follow-ups, so nothing is sent twice.
 */
export async function markOrderPaid(orderId: string, stripeEmail?: string | null): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .update({ payment_status: "paid", paid_at: new Date().toISOString(), ...(stripeEmail ? { customer_email: stripeEmail } : {}) })
    .eq("id", orderId)
    .neq("payment_status", "paid")
    .select("id, created_at, customer_name, customer_email, customer_phone, giveaway_opt_in");
  if (error) throw error;

  const order = data?.[0];
  if (!order) return false;

  after(() => sendOrderConfirmationEmail(order.id));
  after(() => notifyStaffOfNewOrder(order.id));
  if (order.giveaway_opt_in && order.customer_email) {
    await addGiveawayEntry({
      date: new Date(order.created_at),
      name: order.customer_name,
      email: order.customer_email,
      phone: order.customer_phone,
      source: "order",
      orderId: order.id,
    });
  }
  return true;
}

/** Cancels an order that was never paid and gives back any gift card balance it held. */
export async function cancelUnpaidOrder(orderId: string): Promise<void> {
  const { data } = await supabaseAdmin
    .from("orders")
    .update({ fulfillment_status: "cancelled" })
    .eq("id", orderId)
    .neq("payment_status", "paid")
    .neq("fulfillment_status", "cancelled")
    .select("id, gift_card_id, gift_card_units");
  if (data?.[0]) await refundGiftCard(data[0]);
}
