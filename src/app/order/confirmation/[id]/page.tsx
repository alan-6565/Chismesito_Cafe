import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { stripe } from "@/lib/stripe";
import { formatCents } from "@/lib/money";
import { formatOrderStamp, formatPickupTime } from "@/lib/hours";
import { markOrderPaid } from "@/lib/orders";
import ClearCartOnMount from "@/components/ClearCartOnMount";
import { BagIcon, PinIcon, TicketIcon } from "@/components/icons";
import FloralCorner from "@/components/FloralCorner";
import { business } from "@/lib/data";

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
    .select("id, created_at, customer_name, total_cents, fulfillment_status, payment_method, payment_status, pickup_at, gift_card_cents, card_fee_cents, giveaway_opt_in, customer_email")
    .eq("id", id)
    .single();

  if (!order) notFound();

  // The webhook usually flips payment_status to "paid" within a second or two,
  // but if the customer lands back here before it arrives, double-check
  // directly with Stripe rather than showing a stale "unpaid" order.
  if (order.payment_method === "online" && order.payment_status !== "paid" && session_id) {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status === "paid") {
      await markOrderPaid(id, session.customer_details?.email);
      order.payment_status = "paid";
    }
  }

  const { data: items } = await supabaseAdmin
    .from("order_items")
    .select("name_snapshot, price_cents_snapshot, quantity, size_label, modifiers, notes")
    .eq("order_id", id);

  const paidOnline = order.payment_method === "online" && order.payment_status === "paid";

  const status = {
    pending: "Received",
    preparing: "Being prepared",
    ready: "Ready for pickup!",
    completed: "Picked up",
    cancelled: "Cancelled",
  }[order.fulfillment_status as string] ?? "Received";
  const line = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  return (
    <div className="relative overflow-hidden">
      <FloralCorner className="absolute -left-10 -top-6 w-44 sm:w-64 scale-x-100! rotate-180" />
      <FloralCorner className="absolute -right-10 -top-6 w-44 sm:w-64" />
      <div className="relative mx-auto max-w-2xl px-4 sm:px-6 py-14 text-center">
        {paidOnline && <ClearCartOnMount />}
        <svg viewBox="0 0 64 56" className="mx-auto w-24 h-20 text-wine" {...line} strokeWidth={2.2}>
          <path d="M14 26h30v6a14 14 0 0 1-14 14h-2a14 14 0 0 1-14-14v-6ZM44 29h3a5 5 0 0 1 0 10h-4M10 50h38" />
          <path d="M24 20c-2-3 2-5 0-8M32 20c-2-3 2-5 0-8" />
          <path d="M29 33c-1.6-2.2-5-.8-3.3 1.6L29 38l3.3-3.4C34 32.2 30.6 30.8 29 33Z" fill="currentColor" />
          <path d="M6 18l4 3M52 18l-4 3M4 30h5M54 30h5M12 8l3 4M46 8l-3 4" className="text-berry" stroke="currentColor" />
        </svg>
        <h1 className="mt-4 font-display font-black italic text-4xl sm:text-5xl leading-tight text-wine-dark">
          Thank You for
          <br />
          Your Order! <span className="not-italic text-berry">♡</span>
        </h1>
        <p className="mt-3 text-ink/75 sm:text-lg">
          {paidOnline
            ? order.fulfillment_status === "ready"
              ? `Thanks, ${order.customer_name}! Your order is ready, come grab it ♡`
              : order.fulfillment_status === "completed"
                ? `Thanks, ${order.customer_name}! Hope you loved it. See you next time ♡`
                : `Thanks, ${order.customer_name}! Your order has been received and is being prepared with a little extra chisme.`
            : "Your order is in. Show this page (or your name) at pickup and pay in-store."}
        </p>

        <div className="mt-8 card-soft p-6 text-left">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-bold text-xl text-ink">Order #{order.id.slice(0, 8).toUpperCase()}</p>
            <span className="rounded-full bg-blush-soft text-berry text-sm font-semibold px-3 py-1">{status}</span>
          </div>
          <p className="mt-0.5 text-xs text-ink/50">Ordered {formatOrderStamp(order.created_at)}</p>
          <div className="mt-4 grid sm:grid-cols-2 gap-4 sm:divide-x divide-blush">
            <div className="flex items-center gap-3">
              <BagIcon className="w-8 h-8 shrink-0 text-wine" />
              <div>
                <p className="font-bold text-ink">Pickup</p>
                <p className="text-sm text-ink/60">{order.pickup_at ? formatPickupTime(order.pickup_at) : "ASAP · about 5–10 min"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:pl-4">
              <PinIcon className="w-8 h-8 shrink-0 text-wine" />
              <div>
                <p className="font-bold text-ink">Chismesito Café</p>
                <p className="text-sm text-ink/60">{business.streetAddress}, {business.city}, {business.state}</p>
              </div>
            </div>
          </div>

          <details className="mt-5 border-t border-blush pt-4 group">
            <summary className="cursor-pointer list-none flex items-center justify-between text-sm font-semibold text-wine">
              What you ordered
              <span className="transition-transform group-open:rotate-180">⌄</span>
            </summary>
            <div className="mt-3 flex flex-col gap-2.5">
              {items?.map((item, i) => {
                const modifiers = (item.modifiers ?? []) as { group: string; option: string }[];
                const summary = [item.size_label, ...modifiers.map((m) => m.option)].filter(Boolean).join(", ");
                return (
                  <div key={i} className="flex items-start justify-between text-sm gap-3">
                    <span className="text-ink/80">
                      {item.quantity}&times; {item.name_snapshot}
                      {summary && <span className="block text-[11px] text-ink/50">{summary}</span>}
                      {item.notes && <span className="block text-[11px] text-ink/50 italic">Note: {item.notes}</span>}
                    </span>
                    <span className="font-medium shrink-0">{formatCents(item.price_cents_snapshot * item.quantity)}</span>
                  </div>
                );
              })}
              {order.gift_card_cents > 0 && (
                <div className="border-t border-blush pt-2.5 flex justify-between text-sm text-ink/60">
                  <span>Gift card</span>
                  <span>&minus;{formatCents(order.gift_card_cents)}</span>
                </div>
              )}
              {order.card_fee_cents > 0 && (
                <div className="flex justify-between text-sm text-ink/60">
                  <span>Card processing fee</span>
                  <span>{formatCents(order.card_fee_cents)}</span>
                </div>
              )}
              <div className="border-t border-blush pt-2.5 flex justify-between font-bold text-ink">
                <span>{paidOnline ? "Total paid" : "Total due at pickup"}</span>
                <span>{formatCents(order.total_cents - order.gift_card_cents + order.card_fee_cents)}</span>
              </div>
            </div>
          </details>
        </div>

        {paidOnline && order.giveaway_opt_in && order.customer_email && (
          <div className="mt-5 rounded-2xl bg-blush-soft/60 border border-blush px-5 py-4 flex items-center gap-4 text-left">
            <TicketIcon className="w-8 h-8 shrink-0 text-berry" />
            <div>
              <p className="font-semibold text-ink">You&apos;re entered in this month&apos;s giveaway!</p>
              <p className="text-sm text-ink/60">
                We&apos;ll email {order.customer_email} if you win.{" "}
                <Link href="/giveaway" className="underline hover:text-berry">
                  See the prize
                </Link>
              </p>
            </div>
          </div>
        )}

        <div className="mt-8 mx-auto max-w-xs flex flex-col gap-3">
          {/* Reloading shows the latest status from the staff screen */}
          <Link href={`/order/confirmation/${order.id}`} className="rounded-full bg-wine hover:bg-wine-dark text-white font-semibold px-6 py-3.5 shadow-lg shadow-wine/20 transition-colors">
            Track Order
          </Link>
          <Link href="/menu" className="rounded-full border-2 border-wine text-wine font-semibold px-6 py-3 hover:bg-wine hover:text-white transition-colors">
            Return to Menu
          </Link>
        </div>
      </div>
    </div>
  );
}
