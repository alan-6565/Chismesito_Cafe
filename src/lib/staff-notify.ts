import "server-only";
import { resend, FROM_ADDRESS } from "./email";
import { supabaseAdmin } from "./supabase";
import { formatCents } from "./money";

const STAFF_EMAIL = process.env.STAFF_EMAIL;

/**
 * Emails the staff inbox when a new order actually needs attention (paid
 * online, or pay-at-pickup which is actionable immediately). Guarded by
 * staff_notified_at so the webhook and the confirmation-page fallback can't
 * both fire a duplicate for the same order.
 */
export async function notifyStaffOfNewOrder(orderId: string): Promise<void> {
  if (!resend || !STAFF_EMAIL) return;

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("id, customer_name, payment_method, total_cents, staff_notified_at")
    .eq("id", orderId)
    .single();

  if (!order || order.staff_notified_at) return;

  const { count: itemCount } = await supabaseAdmin
    .from("order_items")
    .select("id", { count: "exact", head: true })
    .eq("order_id", orderId);

  const payLine = order.payment_method === "online" ? "Paid online" : "Pay at pickup";

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: STAFF_EMAIL,
    subject: `New order — ${order.customer_name} (${formatCents(order.total_cents)})`,
    html: `<p>New order from <strong>${order.customer_name}</strong> — ${itemCount ?? "?"} item(s), ${formatCents(order.total_cents)}. ${payLine}.</p><p>Order #${order.id.slice(0, 8)}</p>`,
  });

  if (!error) {
    await supabaseAdmin
      .from("orders")
      .update({ staff_notified_at: new Date().toISOString() })
      .eq("id", orderId);
  }
}
