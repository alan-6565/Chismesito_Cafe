"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import OrderPanel from "@/components/OrderPanel";
import { useCart } from "@/lib/cart-context";
import { formatCents } from "@/lib/money";
import { formatTime, getPickupSlots, isOpenNow, type PickupDay } from "@/lib/hours";

export default function CheckoutPage() {
  const { items, totalCents, clear } = useCart();
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState<"pickup" | "online" | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Same mount-then-resolve pattern as OpenStatusBadge, refreshed every
  // minute so slots that pass while the customer is on this page drop off.
  const [pickupDays, setPickupDays] = useState<PickupDay[]>([]);
  const [openNow, setOpenNow] = useState(true);
  const [pickupMode, setPickupMode] = useState<"asap" | "scheduled">("asap");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");

  useEffect(() => {
    const update = () => {
      setPickupDays(getPickupSlots());
      setOpenNow(isOpenNow());
    };
    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Fall back to the first available slot whenever the chosen one is gone
  // (or nothing has been chosen yet); ASAP isn't an option while closed.
  const selectedDay = pickupDays.find((d) => d.date === pickupDate) ?? pickupDays[0];
  const effectiveDate = selectedDay?.date ?? "";
  const effectiveTime = selectedDay?.slots.includes(pickupTime) ? pickupTime : (selectedDay?.slots[0] ?? "");
  const effectiveMode = openNow ? pickupMode : "scheduled";

  const cartPayload = () => ({
    customerName: name,
    customerPhone: phone,
    customerEmail: email,
    pickupSlot: effectiveMode === "scheduled" ? `${effectiveDate}T${effectiveTime}` : undefined,
    items: items.map((i) => ({
      menuItemId: i.menuItemId,
      sizeId: i.sizeId,
      optionIds: i.modifiers.map((m) => m.optionId),
      quantity: i.quantity,
      notes: i.notes,
    })),
  });

  const submitPickupOrder = async () => {
    if (!name.trim()) {
      setError("Please enter your name so we know who's picking up.");
      return;
    }
    if (effectiveMode === "scheduled" && !(effectiveDate && effectiveTime)) {
      setError("Please choose a pickup time.");
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
    if (effectiveMode === "scheduled" && !(effectiveDate && effectiveTime)) {
      setError("Please choose a pickup time.");
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

      // Cart stays intact until payment actually succeeds — if the customer
      // cancels or backs out of Stripe, they land back here with their order
      // still there instead of having to rebuild it from scratch.
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(null);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-blush bg-white px-4 py-3 text-sm focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/15";

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-3xl bg-cream-alt/70 border border-blush/60 px-6 py-14 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose">Checkout</p>
          <h1 className="mt-1 font-display font-bold text-3xl text-maroon">Your order is empty</h1>
          <p className="mt-2 text-ink/60">Add something from the menu before checking out.</p>
          <Link
            href="/menu"
            className="inline-block mt-6 rounded-full bg-rose hover:bg-rose-dark text-white font-semibold px-6 py-3 text-sm transition-colors"
          >
            Browse the Menu
          </Link>
          <p className="mt-8 font-script text-2xl text-rose -rotate-3">Un Cafecito Para Todo ♡</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/menu" className="text-sm text-rose hover:text-rose-dark">
        ‹ Back to menu
      </Link>

      <div className="mt-4 grid lg:grid-cols-[minmax(0,1fr)_360px] gap-8 items-start">
        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose">Checkout</p>
          <h1 className="mt-1 font-display font-bold text-3xl sm:text-4xl text-maroon">Almost Ready!</h1>
          <p className="mt-2 text-ink/60">Tell us who&apos;s picking up and how you&apos;d like to pay.</p>

          <div className="mt-6 rounded-3xl bg-white shadow-sm border border-blush/40 p-6 flex flex-col gap-4">
            <h2 className="font-display font-semibold text-lg text-maroon">Your Details</h2>
            <div>
              <label className="block text-sm font-medium text-maroon mb-1">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={inputClass} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-maroon mb-1">
                  Phone <span className="text-ink/40 font-normal">(optional)</span>
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="For pickup updates"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-maroon mb-1">
                  Email <span className="text-ink/40 font-normal">(optional)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="For a confirmation email"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-3xl bg-white shadow-sm border border-blush/40 p-6 flex flex-col gap-4">
            <h2 className="font-display font-semibold text-lg text-maroon">Pickup Time</h2>
            {pickupDays.length === 0 ? (
              <p className="text-sm text-ink/60">{openNow ? "We'll start on it right away." : "Online ordering opens again soon."}</p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2">
                  {(["asap", "scheduled"] as const).map((mode) => {
                    const disabled = mode === "asap" && !openNow;
                    return (
                      <button
                        key={mode}
                        type="button"
                        disabled={disabled}
                        onClick={() => setPickupMode(mode)}
                        className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors disabled:opacity-40 ${
                          effectiveMode === mode ? "border-rose bg-blush-soft text-rose" : "border-blush text-maroon hover:bg-cream-alt"
                        }`}
                      >
                        {mode === "asap" ? (openNow ? "ASAP" : "ASAP · Closed now") : "Order Ahead"}
                      </button>
                    );
                  })}
                </div>
                {effectiveMode === "scheduled" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-maroon mb-1">Day</label>
                      <select
                        value={effectiveDate}
                        onChange={(e) => {
                          setPickupDate(e.target.value);
                          setPickupTime("");
                        }}
                        className={inputClass}
                      >
                        {pickupDays.map((d) => (
                          <option key={d.date} value={d.date}>
                            {d.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-maroon mb-1">Time</label>
                      <select value={effectiveTime} onChange={(e) => setPickupTime(e.target.value)} className={inputClass}>
                        {selectedDay?.slots.map((t) => (
                          <option key={t} value={t}>
                            {formatTime(t)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="mt-6 rounded-3xl bg-white shadow-sm border border-blush/40 p-6 flex flex-col gap-3">
            <h2 className="font-display font-semibold text-lg text-maroon">How would you like to pay?</h2>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              onClick={submitOnlinePayment}
              disabled={submitting !== null}
              className="rounded-full bg-rose hover:bg-rose-dark disabled:opacity-60 text-white font-semibold px-6 py-3.5 text-sm shadow-sm transition-colors"
            >
              {submitting === "online" ? "Redirecting to payment..." : `Pay Online Now · ${formatCents(totalCents)} ›`}
            </button>
            <button
              onClick={submitPickupOrder}
              disabled={submitting !== null}
              className="rounded-full border-2 border-maroon text-maroon font-semibold px-6 py-3 text-sm hover:bg-maroon hover:text-cream disabled:opacity-60 transition-colors"
            >
              {submitting === "pickup" ? "Placing order..." : "Order Ahead — Pay at Pickup"}
            </button>
            <p className="text-xs text-ink/50 text-center">
              Pay online now, or order ahead and pay with card or cash when you pick it up in-store.
            </p>
          </div>
        </section>

        <aside className="lg:sticky lg:top-24">
          <OrderPanel />
          <p className="mt-6 font-script text-2xl text-rose text-center -rotate-6">Un Cafecito Para Todo ♡</p>
        </aside>
      </div>
    </div>
  );
}
