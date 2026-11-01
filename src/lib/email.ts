import "server-only";
import { Resend } from "resend";
import QRCode from "qrcode";
import { supabaseAdmin } from "./supabase";
import { formatCents } from "./money";
import { business } from "./data";
import { formatOrderStamp, formatPickupTime } from "./hours";
import { describeValue, formatCode, type GiftCard } from "./gift-cards";

export const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Resend's shared "onboarding@resend.dev" sender only delivers to the email
// address on the Resend account itself — it cannot reach real customers.
// Once a domain is verified in Resend, set RESEND_FROM_ADDRESS (e.g.
// "Chismesito Cafe <orders@chismesitocafe.com>") to start sending for real.
export const FROM_ADDRESS = process.env.RESEND_FROM_ADDRESS || "Chismesito Cafe <onboarding@resend.dev>";

type OrderForEmail = {
  id: string;
  customer_name: string;
  customer_email: string | null;
  payment_method: "online" | "pickup";
  total_cents: number;
};

type OrderItemForEmail = {
  name_snapshot: string;
  price_cents_snapshot: number;
  quantity: number;
  size_label: string | null;
  modifiers: { group: string; option: string }[];
};

function itemsHtml(items: OrderItemForEmail[]): string {
  return items
    .map((item) => {
      const summary = [item.size_label, ...item.modifiers.map((m) => m.option)]
        .filter(Boolean)
        .join(", ");
      return `
        <tr>
          <td style="padding:8px 0;color:#2c1116;font-size:14px;">
            ${item.quantity}&times; ${item.name_snapshot}
            ${summary ? `<div style="color:#6b4a50;font-size:11px;margin-top:2px;">${summary}</div>` : ""}
          </td>
          <td style="padding:8px 0;color:#451820;font-weight:600;font-size:14px;text-align:right;white-space:nowrap;">
            ${formatCents(item.price_cents_snapshot * item.quantity)}
          </td>
        </tr>`;
    })
    .join("");
}

/**
 * Sends the order confirmation email once, guarded by
 * confirmation_email_sent_at so the webhook and the confirmation-page
 * fallback can't both fire a duplicate for the same order.
 */
export async function sendOrderConfirmationEmail(orderId: string): Promise<void> {
  if (!resend) return; // RESEND_API_KEY not configured yet — skip silently

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("id, created_at, customer_name, customer_email, payment_method, total_cents, gift_card_cents, card_fee_cents, pickup_at, confirmation_email_sent_at")
    .eq("id", orderId)
    .single();

  if (!order || !order.customer_email || order.confirmation_email_sent_at) return;

  const { data: items } = await supabaseAdmin
    .from("order_items")
    .select("name_snapshot, price_cents_snapshot, quantity, size_label, modifiers")
    .eq("order_id", orderId);

  const paidOnline = order.payment_method === "online";
  const totalLabel = paidOnline ? "Total paid" : "Total due at pickup";
  const readyLine = order.pickup_at
    ? `it'll be ready for pickup ${formatPickupTime(order.pickup_at)}`
    : "it'll be ready in about 5-10 minutes";
  const bodyLine = paidOnline
    ? `Your order is paid and in — ${readyLine}. Show this email (or your name) at pickup.`
    : `Your order is in — ${readyLine}. Show this email (or your name) at pickup and pay in-store.`;

  const html = `
    <div style="background:#fdf6ef;padding:32px 16px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
      <div style="max-width:480px;margin:0 auto;">
        <p style="text-align:center;font-size:32px;margin:0 0 8px;">🌸</p>
        <h1 style="text-align:center;color:#451820;font-size:24px;margin:0 0 8px;">Thanks, ${order.customer_name}!</h1>
        <p style="text-align:center;color:#6b4a50;font-size:14px;margin:0 0 4px;">${bodyLine}</p>
        <p style="text-align:center;color:#a08890;font-size:11px;font-family:ui-monospace,monospace;margin:0 0 24px;">Order #${order.id.slice(0, 8)} &middot; ${formatOrderStamp(order.created_at)}</p>

        <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;padding:20px 24px;">
          ${itemsHtml(items ?? [])}
          ${
            order.gift_card_cents > 0
              ? `<tr>
            <td style="padding-top:12px;border-top:1px solid #f3d9de;color:#6b4a50;font-size:14px;">Gift card</td>
            <td style="padding-top:12px;border-top:1px solid #f3d9de;color:#6b4a50;font-size:14px;text-align:right;">&minus;${formatCents(order.gift_card_cents)}</td>
          </tr>`
              : ""
          }
          ${
            order.card_fee_cents > 0
              ? `<tr>
            <td style="padding-top:8px;color:#6b4a50;font-size:14px;">Card processing fee</td>
            <td style="padding-top:8px;color:#6b4a50;font-size:14px;text-align:right;">${formatCents(order.card_fee_cents)}</td>
          </tr>`
              : ""
          }
          <tr>
            <td style="padding-top:12px;border-top:1px solid #f3d9de;color:#451820;font-weight:700;font-size:14px;">${totalLabel}</td>
            <td style="padding-top:12px;border-top:1px solid #f3d9de;color:#451820;font-weight:700;font-size:14px;text-align:right;">${formatCents(order.total_cents - order.gift_card_cents + order.card_fee_cents)}</td>
          </tr>
        </table>

        <p style="text-align:center;color:#a08890;font-size:12px;margin:24px 0 0;">
          ${business.name} &middot; ${business.address}
        </p>
      </div>
    </div>`;

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: order.customer_email,
    subject: `Your order at ${business.name} — #${order.id.slice(0, 8)}`,
    html,
  });

  if (error) {
    console.error(`[email] send failed for order ${orderId}:`, error);
  } else {
    await supabaseAdmin
      .from("orders")
      .update({ confirmation_email_sent_at: new Date().toISOString() })
      .eq("id", orderId);
  }
}

/**
 * Sends a "your order is ready" email once staff marks an order ready for
 * pickup in /admin/orders. Guarded by ready_email_sent_at the same way the
 * confirmation email is, so re-toggling the status can't re-send it.
 */
export async function sendOrderReadyEmail(orderId: string): Promise<void> {
  if (!resend) return;

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("id, customer_name, customer_email, ready_email_sent_at")
    .eq("id", orderId)
    .single();

  if (!order || !order.customer_email || order.ready_email_sent_at) return;

  const html = `
    <div style="background:#fdf6ef;padding:32px 16px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
      <div style="max-width:480px;margin:0 auto;text-align:center;">
        <p style="font-size:32px;margin:0 0 8px;">☕</p>
        <h1 style="color:#451820;font-size:24px;margin:0 0 8px;">Your order is ready!</h1>
        <p style="color:#6b4a50;font-size:14px;margin:0 0 4px;">
          Come on in, ${order.customer_name} — it's ready and waiting for you at the counter.
        </p>
        <p style="color:#a08890;font-size:11px;font-family:ui-monospace,monospace;margin:16px 0 0;">Order #${order.id.slice(0, 8)}</p>
        <p style="color:#a08890;font-size:12px;margin:24px 0 0;">
          ${business.name} &middot; ${business.address}
        </p>
      </div>
    </div>`;

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: order.customer_email,
    subject: `Your order is ready — ${business.name}`,
    html,
  });

  if (error) {
    console.error(`[email] send failed for order ${orderId}:`, error);
  } else {
    await supabaseAdmin
      .from("orders")
      .update({ ready_email_sent_at: new Date().toISOString() })
      .eq("id", orderId);
  }
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

/**
 * Emails a gift card's code to its recipient. `prize` is set when it was won
 * in the monthly giveaway, which changes the wording.
 */
export async function sendGiftCardEmail(card: GiftCard, prize?: string): Promise<boolean> {
  if (!resend || !card.recipient_email) return false;

  const name = card.recipient_name ? `, ${escapeHtml(card.recipient_name)}` : "";
  const headline = prize ? `You won${name}! 🎉` : `A gift for you${name}!`;
  const intro = prize
    ? `You're a winner in the ${business.name} monthly giveaway — your prize is <strong>${prize}</strong>.`
    : `You've got a ${business.name} gift card for <strong>${describeValue(card.kind, card.initial_value)}</strong>.`;
  const howTo =
    card.kind === "drinks"
      ? "Enter this code at checkout when you order online, or show this email at the counter and we'll scan it — any size, any flavor."
      : "Enter this code at checkout when you order online, or show this email at the counter and we'll scan it. Whatever you don't spend stays on the card for next time.";

  const html = `
    <div style="background:#fdf6ef;padding:32px 16px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
      <div style="max-width:480px;margin:0 auto;text-align:center;">
        <p style="font-size:32px;margin:0 0 8px;">🎁</p>
        <h1 style="color:#451820;font-size:24px;margin:0 0 8px;">${headline}</h1>
        <p style="color:#6b4a50;font-size:14px;margin:0 0 24px;">${intro}</p>
        <div style="background:#ffffff;border-radius:16px;padding:24px;">
          <p style="color:#a08890;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px;">Your code</p>
          <img src="cid:giftcard-qr" width="180" height="180" alt="Gift card QR code" style="display:block;margin:0 auto 12px;" />
          <p style="color:#451820;font-size:30px;font-weight:700;letter-spacing:4px;font-family:ui-monospace,monospace;margin:0 0 8px;">${formatCode(card.code)}</p>
          <p style="color:#6b4a50;font-size:13px;margin:0;">${describeValue(card.kind, card.initial_value)}</p>
        </div>
        <p style="color:#6b4a50;font-size:13px;margin:20px 0 0;">${howTo}</p>
        <p style="color:#a08890;font-size:12px;margin:24px 0 0;">
          ${business.name} &middot; ${business.address}
        </p>
      </div>
    </div>`;

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: card.recipient_email,
    subject: prize ? `You won the ${business.name} giveaway!` : `Your ${business.name} gift card`,
    html,
    // Sent inside the email (not linked) so it shows even offline at the counter.
    attachments: [
      {
        filename: "gift-card-qr.png",
        content: await QRCode.toBuffer(card.code, { width: 360, margin: 1, color: { dark: "#451820", light: "#ffffff" } }),
        contentId: "giftcard-qr",
      },
    ],
  });

  if (error) {
    console.error(`[email] gift card send failed for card ${card.id}:`, error);
    return false;
  }
  await supabaseAdmin.from("gift_cards").update({ emailed_at: new Date().toISOString() }).eq("id", card.id);
  return true;
}
