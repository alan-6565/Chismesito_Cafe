import "server-only";
import { Resend } from "resend";
import { supabaseAdmin } from "./supabase";
import { formatCents } from "./money";
import { business } from "./data";

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
    .select("id, customer_name, customer_email, payment_method, total_cents, confirmation_email_sent_at")
    .eq("id", orderId)
    .single();

  if (!order || !order.customer_email || order.confirmation_email_sent_at) return;

  const { data: items } = await supabaseAdmin
    .from("order_items")
    .select("name_snapshot, price_cents_snapshot, quantity, size_label, modifiers")
    .eq("order_id", orderId);

  const paidOnline = order.payment_method === "online";
  const totalLabel = paidOnline ? "Total paid" : "Total due at pickup";
  const bodyLine = paidOnline
    ? "Your order is paid and in — it'll be ready in about 5-10 minutes. Show this email (or your name) at pickup."
    : "Your order is in — it'll be ready in about 5-10 minutes. Show this email (or your name) at pickup and pay in-store.";

  const html = `
    <div style="background:#fdf6ef;padding:32px 16px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
      <div style="max-width:480px;margin:0 auto;">
        <p style="text-align:center;font-size:32px;margin:0 0 8px;">🌸</p>
        <h1 style="text-align:center;color:#451820;font-size:24px;margin:0 0 8px;">Thanks, ${order.customer_name}!</h1>
        <p style="text-align:center;color:#6b4a50;font-size:14px;margin:0 0 4px;">${bodyLine}</p>
        <p style="text-align:center;color:#a08890;font-size:11px;font-family:ui-monospace,monospace;margin:0 0 24px;">Order #${order.id.slice(0, 8)}</p>

        <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;padding:20px 24px;">
          ${itemsHtml(items ?? [])}
          <tr>
            <td style="padding-top:12px;border-top:1px solid #f3d9de;color:#451820;font-weight:700;font-size:14px;">${totalLabel}</td>
            <td style="padding-top:12px;border-top:1px solid #f3d9de;color:#451820;font-weight:700;font-size:14px;text-align:right;">${formatCents(order.total_cents)}</td>
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

  if (!error) {
    await supabaseAdmin
      .from("orders")
      .update({ confirmation_email_sent_at: new Date().toISOString() })
      .eq("id", orderId);
  }
}

/**
 * Sends a "your order is complete" email once staff marks an order
 * completed in /admin/orders. Guarded by completion_email_sent_at the same
 * way the confirmation email is, so re-toggling the status can't re-send it.
 */
export async function sendOrderCompleteEmail(orderId: string): Promise<void> {
  if (!resend) return;

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("id, customer_name, customer_email, completion_email_sent_at")
    .eq("id", orderId)
    .single();

  if (!order || !order.customer_email || order.completion_email_sent_at) return;

  const html = `
    <div style="background:#fdf6ef;padding:32px 16px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
      <div style="max-width:480px;margin:0 auto;text-align:center;">
        <p style="font-size:32px;margin:0 0 8px;">☕</p>
        <h1 style="color:#451820;font-size:24px;margin:0 0 8px;">Your order is complete!</h1>
        <p style="color:#6b4a50;font-size:14px;margin:0 0 4px;">
          Thanks for stopping by, ${order.customer_name} — we hope you enjoyed it!
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
    subject: `Your order is complete — ${business.name}`,
    html,
  });

  if (!error) {
    await supabaseAdmin
      .from("orders")
      .update({ completion_email_sent_at: new Date().toISOString() })
      .eq("id", orderId);
  }
}
