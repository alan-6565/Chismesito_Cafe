import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { stripe } from "@/lib/stripe";
import { formatCents } from "@/lib/money";
import { formatOrderStamp, formatPickupTime } from "@/lib/hours";
import { markOrderPaid } from "@/lib/orders";
import ClearCartOnMount from "@/components/ClearCartOnMount";
import { TicketIcon } from "@/components/icons";

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
    .select("id, created_at, customer_name, total_cents, fulfillment_status, payment_method, payment_status, pickup_at, gift_card_cents, giveaway_opt_in, customer_email")
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

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-16 text-center">
      {paidOnline && <ClearCartOnMount />}
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
      <p className="mt-1 text-sm text-ink/60">Ordered {formatOrderStamp(order.created_at)}</p>
      <p className="mt-3 inline-block rounded-full bg-blush-soft text-rose text-sm font-semibold px-4 py-1.5">
        Pickup: {order.pickup_at ? formatPickupTime(order.pickup_at) : "ASAP (about 5-10 min)"}
      </p>

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
                {item.notes && <span className="block text-[11px] text-ink/50 italic">Note: {item.notes}</span>}
              </span>
              <span className="text-maroon font-medium shrink-0">
                {formatCents(item.price_cents_snapshot * item.quantity)}
              </span>
            </div>
          );
        })}
        {order.gift_card_cents > 0 && (
          <div className="border-t border-blush pt-3 flex items-center justify-between text-sm text-ink/60">
            <span>Gift card</span>
            <span>&minus;{formatCents(order.gift_card_cents)}</span>
          </div>
        )}
        <div className="border-t border-blush pt-3 flex items-center justify-between font-semibold text-maroon">
          <span>{paidOnline ? "Total paid" : "Total due at pickup"}</span>
          <span>{formatCents(order.total_cents - order.gift_card_cents)}</span>
        </div>
      </div>

      {paidOnline && order.giveaway_opt_in && order.customer_email && (
        <div className="mt-6 rounded-2xl bg-blush-soft/60 border border-blush px-5 py-4 flex items-center gap-4 text-left">
          <TicketIcon className="w-8 h-8 shrink-0 text-rose" />
          <div>
            <p className="font-semibold text-maroon">You&apos;re entered in this month&apos;s giveaway!</p>
            <p className="text-sm text-ink/60">
              We&apos;ll email {order.customer_email} if you win.{" "}
              <Link href="/#giveaway" className="underline hover:text-rose">
                See the prizes
              </Link>
            </p>
          </div>
        </div>
      )}

      <Link
        href="/menu"
        className="inline-block mt-8 rounded-full border-2 border-maroon text-maroon font-semibold px-6 py-3 text-sm hover:bg-maroon hover:text-cream transition-colors"
      >
        Back to Menu
      </Link>
    </div>
  );
}
