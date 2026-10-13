"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import OrderPanel from "@/components/OrderPanel";
import { useCart } from "@/lib/cart-context";
import { formatCents } from "@/lib/money";
import { formatTime, getPickupSlots, isOpenNow, type PickupDay } from "@/lib/hours";
import { GiftIcon } from "@/components/icons";

type AppliedGiftCard = { code: string; discountCents: number; balanceLabel: string; cartKey: string };

export default function CheckoutPage() {
  const { items, totalCents } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Same mount-then-resolve pattern as OpenStatusBadge, refreshed every
  // minute so slots that pass while the customer is on this page drop off.
  const [pickupDays, setPickupDays] = useState<PickupDay[]>([]);
  const [openNow, setOpenNow] = useState(true);
  const [pickupMode, setPickupMode] = useState<"asap" | "scheduled">("asap");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [giftCodeInput, setGiftCodeInput] = useState("");
  const [giftCard, setGiftCard] = useState<AppliedGiftCard | null>(null);
  const [giftError, setGiftError] = useState<string | null>(null);
  const [applyingGift, setApplyingGift] = useState(false);
  const [giveawayOptIn, setGiveawayOptIn] = useState(true);

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

  const cartLines = items.map((i) => ({
    menuItemId: i.menuItemId,
    sizeId: i.sizeId,
    optionIds: i.modifiers.map((m) => m.optionId),
    quantity: i.quantity,
    notes: i.notes,
  }));
  // A gift card's discount depends on the cart, so editing the cart after
  // applying one means it has to be applied again.
  const cartKey = JSON.stringify(cartLines);
  const appliedGift = giftCard?.cartKey === cartKey ? giftCard : null;
  const amountDueCents = totalCents - (appliedGift?.discountCents ?? 0);

  const cartPayload = () => ({
    customerName: name,
    customerPhone: phone,
    customerEmail: email,
    pickupSlot: effectiveMode === "scheduled" ? `${effectiveDate}T${effectiveTime}` : undefined,
    giftCardCode: appliedGift?.code,
    giveawayOptIn,
    items: cartLines,
  });

  const applyGiftCard = async () => {
    if (!giftCodeInput.trim()) return;
    setApplyingGift(true);
    setGiftError(null);
    try {
      const res = await fetch("/api/gift-cards/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: giftCodeInput, items: cartLines }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not check that code");
      setGiftCard({ ...data, cartKey });
      setGiftCodeInput("");
    } catch (err) {
      setGiftError(err instanceof Error ? err.message : "Could not check that code");
    } finally {
      setApplyingGift(false);
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
    setSubmitting(true);
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
      setSubmitting(false);
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
          <p className="mt-2 text-ink/60">Tell us who&apos;s picking up, then pay securely online.</p>

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

          <div className="mt-6 rounded-3xl bg-blush-soft/60 border border-blush p-6 flex gap-4">
            <GiftIcon className="w-8 h-8 shrink-0 text-rose" />
            <div className="flex-1">
              <h2 className="font-display font-semibold text-lg text-maroon">Enter our monthly giveaway?</h2>
              <p className="mt-1 text-sm text-ink/60">
                One winner gets 2 free drinks (any size) plus a $15 digital gift card, picked at the start of every
                month.
              </p>
              <label className="mt-4 flex items-center gap-3 cursor-pointer">
                <button
                  type="button"
                  role="switch"
                  aria-checked={giveawayOptIn}
                  onClick={() => setGiveawayOptIn((v) => !v)}
                  className={`relative w-11 h-6 shrink-0 rounded-full transition-colors ${giveawayOptIn ? "bg-rose" : "bg-ink/20"}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      giveawayOptIn ? "translate-x-5" : ""
                    }`}
                  />
                </button>
                <span className="text-sm font-medium text-maroon">Yes, enter me in this month&apos;s giveaway</span>
              </label>
              <p className="mt-3 text-xs text-ink/50">
                No purchase necessary — anyone can{" "}
                <Link href="/#giveaway" target="_blank" className="underline hover:text-rose">
                  enter for free
                </Link>
                . Every order adds an entry.{" "}
                <Link href="/giveaway/rules" target="_blank" className="underline hover:text-rose">
                  Official rules
                </Link>
                .
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-3xl bg-white shadow-sm border border-blush/40 p-6 flex flex-col gap-3">
            <h2 className="font-display font-semibold text-lg text-maroon">Payment</h2>

            {appliedGift ? (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-blush bg-cream-alt/60 px-4 py-3">
                <div className="text-sm">
                  <p className="font-semibold text-maroon">Gift card {appliedGift.code}</p>
                  <p className="text-xs text-ink/50">Balance: {appliedGift.balanceLabel}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setGiftCard(null)}
                  className="text-xs font-semibold text-ink/50 hover:text-rose"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-maroon mb-1">
                  Gift card <span className="text-ink/40 font-normal">(optional)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    value={giftCodeInput}
                    onChange={(e) => setGiftCodeInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && applyGiftCard()}
                    placeholder="XXXX-XXXX"
                    className={`${inputClass} uppercase font-mono tracking-wider`}
                  />
                  <button
                    type="button"
                    onClick={applyGiftCard}
                    disabled={applyingGift || !giftCodeInput.trim()}
                    className="shrink-0 rounded-xl border border-maroon text-maroon font-semibold px-4 text-sm hover:bg-maroon hover:text-cream disabled:opacity-40 transition-colors"
                  >
                    {applyingGift ? "..." : "Apply"}
                  </button>
                </div>
                {giftError && <p className="mt-1.5 text-xs text-red-600">{giftError}</p>}
                {giftCard && !appliedGift && (
                  <p className="mt-1.5 text-xs text-ink/50">Your order changed — please apply your gift card again.</p>
                )}
              </div>
            )}

            <div className="flex flex-col gap-1 text-sm border-t border-blush pt-3">
              <div className="flex justify-between text-ink/60">
                <span>Subtotal</span>
                <span>{formatCents(totalCents)}</span>
              </div>
              {appliedGift && (
                <div className="flex justify-between text-ink/60">
                  <span>Gift card</span>
                  <span>&minus;{formatCents(appliedGift.discountCents)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-maroon">
                <span>Total</span>
                <span>{formatCents(amountDueCents)}</span>
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              onClick={submitOnlinePayment}
              disabled={submitting}
              className="rounded-full bg-rose hover:bg-rose-dark disabled:opacity-60 text-white font-semibold px-6 py-3.5 text-sm shadow-sm transition-colors"
            >
              {submitting
                ? amountDueCents === 0
                  ? "Placing your order..."
                  : "Redirecting to payment..."
                : amountDueCents === 0
                  ? "Place Order ›"
                  : `Pay ${formatCents(amountDueCents)} ›`}
            </button>
            <p className="text-xs text-ink/50 text-center">
              {amountDueCents === 0
                ? "Your gift card covers this whole order."
                : "All orders are paid online when you order, so it’s ready to grab when you get here."}
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
