"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart, summarizeCartLine } from "@/lib/cart-context";
import { formatCents } from "@/lib/money";

export default function CheckoutPage() {
  const { items, totalCents, clear } = useCart();
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState<"pickup" | "online" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cartPayload = () => ({
    customerName: name,
    customerPhone: phone,
    customerEmail: email,
    items: items.map((i) => ({
      menuItemId: i.menuItemId,
      sizeId: i.sizeId,
      optionIds: i.modifiers.map((m) => m.optionId),
      quantity: i.quantity,
    })),
  });

  const submitPickupOrder = async () => {
    if (!name.trim()) {
      setError("Please enter your name so we know who's picking up.");
      return;
    }
    setSubmitting("pickup");
    setError(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cartPayload()),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      clear();
      router.push(`/order/confirmation/${data.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(null);
    }
  };

  const submitOnlinePayment = async () => {
    if (!name.trim()) {
      setError("Please enter your name so we know who's picking up.");
      return;
    }
    setSubmitting("online");
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cartPayload()),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Something went wrong");

      clear();
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="font-display font-bold text-2xl text-maroon">Your cart is empty</h1>
        <p className="mt-2 text-ink/60">Add something from the menu before checking out.</p>
        <Link
          href="/menu"
          className="inline-block mt-6 rounded-full bg-rose hover:bg-rose-dark text-white font-semibold px-6 py-3 text-sm transition-colors"
        >
          Browse the Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display font-bold text-3xl text-maroon text-center">Checkout</h1>

      <div className="mt-8 rounded-2xl bg-white shadow-sm p-6 flex flex-col gap-3">
        {items.map((item) => (
          <div key={item.cartLineId} className="flex items-start justify-between text-sm gap-3">
            <span className="text-ink/80">
              {item.quantity}&times; {item.name}
              {summarizeCartLine(item) && (
                <span className="block text-[11px] text-ink/50">{summarizeCartLine(item)}</span>
              )}
            </span>
            <span className="text-maroon font-medium shrink-0">
              {formatCents(item.unitPriceCents * item.quantity)}
            </span>
          </div>
        ))}
        <div className="border-t border-blush pt-3 flex items-center justify-between font-semibold text-maroon">
          <span>Total</span>
          <span>{formatCents(totalCents)}</span>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-maroon mb-1">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-xl border border-blush px-4 py-2.5 text-sm focus:outline-none focus:border-rose"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-maroon mb-1">
            Phone <span className="text-ink/40">(optional)</span>
          </label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="For pickup updates"
            className="w-full rounded-xl border border-blush px-4 py-2.5 text-sm focus:outline-none focus:border-rose"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-maroon mb-1">
            Email <span className="text-ink/40">(optional — for a confirmation email)</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-blush px-4 py-2.5 text-sm focus:outline-none focus:border-rose"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="grid sm:grid-cols-2 gap-3 mt-2">
          <button
            onClick={submitPickupOrder}
            disabled={submitting !== null}
            className="rounded-full bg-rose hover:bg-rose-dark disabled:opacity-60 text-white font-semibold px-6 py-3 text-sm transition-colors"
          >
            {submitting === "pickup" ? "Placing order..." : "Order Ahead — Pay at Pickup"}
          </button>
          <button
            onClick={submitOnlinePayment}
            disabled={submitting !== null}
            className="rounded-full border-2 border-maroon text-maroon font-semibold px-6 py-3 text-sm hover:bg-maroon hover:text-cream disabled:opacity-60 transition-colors"
          >
            {submitting === "online" ? "Redirecting to payment..." : "Pay Online Now"}
          </button>
        </div>
        <p className="text-xs text-ink/40 text-center">
          Pay online now, or order ahead and pay with card or cash when you pick it up in-store.
        </p>
      </div>
    </div>
  );
}
