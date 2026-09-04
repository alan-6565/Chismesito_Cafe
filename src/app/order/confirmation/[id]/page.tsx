import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { stripe } from "@/lib/stripe";
import { formatCents } from "@/lib/money";
import { sendOrderConfirmationEmail } from "@/lib/email";

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { id } = await params;
  const { session_id } = await searchParams;

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("id, created_at, customer_name, total_cents, fulfillment_status, payment_method, payment_status")
    .eq("id", id)
    .single();

  if (!order) notFound();

  // The webhook usually flips payment_status to "paid" within a second or two,
  // but if the customer lands back here before it arrives, double-check
  // directly with Stripe rather than showing a stale "unpaid" order.
  if (order.payment_method === "online" && order.payment_status !== "paid" && session_id) {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status === "paid") {
      const stripeEmail = session.customer_details?.email;
      await supabaseAdmin
        .from("orders")
        .update({ payment_status: "paid", ...(stripeEmail ? { customer_email: stripeEmail } : {}) })
        .eq("id", id);
      order.payment_status = "paid";
      sendOrderConfirmationEmail(id).catch(() => {});
    }
  }

  const { data: items } = await supabaseAdmin
    .from("order_items")
    .select("name_snapshot, price_cents_snapshot, quantity, size_label, modifiers")
    .eq("order_id", id);

  const paidOnline = order.payment_method === "online" && order.payment_status === "paid";

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-16 text-center">
      <span className="text-5xl">🌸</span>
      <h1 className="mt-4 font-display font-bold text-3xl text-maroon">
        Thanks, {order.customer_name}!
      </h1>
      <p className="mt-2 text-ink/60">
        {paidOnline
          ? "Your order is paid and in. Show this confirmation (or your name) at pickup."
          : "Your order is in. Show this confirmation (or your name) at pickup and pay in-store."}
      </p>
      <p className="mt-1 text-xs text-ink/40 font-mono">Order #{order.id.slice(0, 8)}</p>

      <div className="mt-8 rounded-2xl bg-white shadow-sm p-6 flex flex-col gap-3 text-left">
        {items?.map((item, i) => {
          const modifiers = (item.modifiers ?? []) as { group: string; option: string }[];
          const summary = [item.size_label, ...modifiers.map((m) => m.option)]
            .filter(Boolean)
            .join(", ");
          return (
            <div key={i} className="flex items-start justify-between text-sm gap-3">
              <span className="text-ink/80">
                {item.quantity}&times; {item.name_snapshot}
                {summary && <span className="block text-[11px] text-ink/50">{summary}</span>}
              </span>
              <span className="text-maroon font-medium shrink-0">
                {formatCents(item.price_cents_snapshot * item.quantity)}
              </span>
            </div>
          );
        })}
        <div className="border-t border-blush pt-3 flex items-center justify-between font-semibold text-maroon">
          <span>{paidOnline ? "Total paid" : "Total due at pickup"}</span>
          <span>{formatCents(order.total_cents)}</span>
        </div>
      </div>

      <Link
        href="/menu"
        className="inline-block mt-8 rounded-full border-2 border-maroon text-maroon font-semibold px-6 py-3 text-sm hover:bg-maroon hover:text-cream transition-colors"
      >
        Back to Menu
      </Link>
    </div>
  );
}
