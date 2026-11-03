"use client";

import { useOrderingPause } from "@/lib/use-ordering-pause";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import FloralCorner from "@/components/FloralCorner";
import { summarizeCartLine, useCart } from "@/lib/cart-context";
import { business } from "@/lib/data";
import { formatCents } from "@/lib/money";
import { cardFeeFor } from "@/lib/card-fee";
import { formatTime, getPickupSlots, isOpenNow, type PickupDay } from "@/lib/hours";
import { GiftIcon, PinIcon } from "@/components/icons";

type AppliedGiftCard = { code: string; discountCents: number; balanceLabel: string; cartKey: string };

export default function CheckoutPage() {
  const { items, totalCents, updateQuantity } = useCart();
  const { paused, backAt } = useOrderingPause();
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
  const cardFeeCents = cardFeeFor(totalCents - (appliedGift?.discountCents ?? 0));
  const amountDueCents = totalCents - (appliedGift?.discountCents ?? 0) + cardFeeCents;

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
    "w-full rounded-xl border border-blush bg-white px-4 py-3 text-sm focus:outline-none focus:border-berry focus:ring-2 focus:ring-berry/15";

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

  const asapLabel = openNow ? "~15 min" : "Closed now";
  const stepNow = !name.trim() ? 2 : 3;
  const steps = ["Order", "Pickup", "Payment"];
  const card = "card-soft p-5 sm:p-6";

  return (
    <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <FloralCorner className="hidden lg:block absolute -right-24 bottom-0 w-72 rotate-180" />

      {/* Steps */}
      <ol className="mx-auto max-w-xl flex items-center gap-3">
        {steps.map((label, i) => {
          const n = i + 1;
          const done = n < stepNow;
          const on = n <= stepNow;
          return (
            <li key={label} className={`flex items-center gap-2.5 ${i < steps.length - 1 ? "flex-1" : ""}`}>
              <span className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-sm font-bold ${on ? "bg-wine text-white" : "bg-ink/25 text-white"}`}>
                {done ? "✓" : n}
              </span>
              <span className={`text-sm font-semibold ${on ? "text-ink" : "text-ink/50"}`}>{label}</span>
              {i < steps.length - 1 && <span className="h-px flex-1 bg-ink/25" />}
            </li>
          );
        })}
      </ol>

      <div className="mt-8 grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-6 items-start">
        <div className="flex flex-col gap-6 min-w-0">
          {/* Your order */}
          <section className={card}>
            <div className="flex items-baseline justify-between">
              <h2 className="font-bold text-xl text-ink">Your Order ({items.reduce((n, i) => n + i.quantity, 0)})</h2>
              <Link href="/menu" className="text-sm font-semibold text-wine underline hover:text-berry">
                Edit
              </Link>
            </div>
            <ul className="mt-4 divide-y divide-blush">
              {items.map((item) => (
                <li key={item.cartLineId} className="flex items-center gap-3 sm:gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-2xl overflow-hidden bg-blush-soft">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                    ) : (
                      <Image src="/images/logo-clear.png" alt="" fill sizes="80px" className="object-contain p-2" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-ink leading-snug">{item.name}</p>
                    {summarizeCartLine(item) && <p className="text-sm text-ink/60 line-clamp-2">{summarizeCartLine(item).replaceAll(", ", " · ")}</p>}
                    {item.notes && <p className="text-xs text-ink/50 italic truncate">Note: {item.notes}</p>}
                    <p className="mt-0.5 font-bold text-ink">{formatCents(item.unitPriceCents * item.quantity)}</p>
                  </div>
                  <div className="flex items-center rounded-full border border-blush bg-white shrink-0">
                    <button onClick={() => updateQuantity(item.cartLineId, item.quantity - 1)} aria-label={`Decrease ${item.name} quantity`} className="w-8 h-8 text-lg text-ink">
                      &minus;
                    </button>
                    <span className="w-5 text-center text-sm font-semibold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.cartLineId, item.quantity + 1)} aria-label={`Increase ${item.name} quantity`} className="w-8 h-8 text-lg text-ink">
                      +
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Pickup */}
          <section className={card}>
            <h2 className="font-bold text-xl text-ink">Pickup Details</h2>
            {pickupDays.length === 0 && !openNow ? (
              <p className="mt-3 text-sm text-ink/60">Online ordering opens again soon.</p>
            ) : (
              <>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {(["asap", "scheduled"] as const).map((mode) => {
                    const disabled = mode === "asap" ? !openNow : pickupDays.length === 0;
                    const on = effectiveMode === mode;
                    return (
                      <button
                        key={mode}
                        type="button"
                        disabled={disabled}
                        onClick={() => setPickupMode(mode)}
                        className={`rounded-2xl border px-4 py-3 text-center transition-colors disabled:opacity-40 ${on ? "border-berry bg-blush-soft" : "border-blush bg-white hover:border-berry/50"}`}
                      >
                        <span className={`block font-bold ${on ? "text-berry" : "text-ink"}`}>{mode === "asap" ? "ASAP" : "Schedule"}</span>
                        <span className="block text-xs text-ink/60">{mode === "asap" ? asapLabel : "Choose a time"}</span>
                      </button>
                    );
                  })}
                </div>
                {effectiveMode === "scheduled" && pickupDays.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <select
                      value={effectiveDate}
                      onChange={(e) => {
                        setPickupDate(e.target.value);
                        setPickupTime("");
                      }}
                      aria-label="Pickup day"
                      className={inputClass}
                    >
                      {pickupDays.map((d) => (
                        <option key={d.date} value={d.date}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                    <select value={effectiveTime} onChange={(e) => setPickupTime(e.target.value)} aria-label="Pickup time" className={inputClass}>
                      {selectedDay?.slots.map((t) => (
                        <option key={t} value={t}>
                          {formatTime(t)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}
            <p className="mt-4 flex items-start gap-2.5">
              <PinIcon className="w-5 h-5 shrink-0 mt-0.5 text-wine" />
              <span>
                <span className="block font-bold text-ink">Pickup at Chismesito Café</span>
                <span className="text-sm text-ink/60">{business.streetAddress}, {business.city}, {business.state}</span>
              </span>
            </p>
          </section>

          {/* Who's picking up */}
          <section className={card}>
            <h2 className="font-bold text-xl text-ink">Your Info</h2>
            <div className="mt-4 flex flex-col gap-3">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name (for pickup)" autoComplete="name" aria-label="Name" className={inputClass} />
              <div className="grid sm:grid-cols-2 gap-3">
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (optional)" type="tel" autoComplete="tel" aria-label="Phone" className={inputClass} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optional)" autoComplete="email" aria-label="Email" className={inputClass} />
              </div>
            </div>
          </section>

          {/* Giveaway */}
          <section className="rounded-3xl bg-blush-soft/70 border border-blush p-5 sm:p-6 flex gap-4">
            <GiftIcon className="w-8 h-8 shrink-0 text-berry" />
            <div className="flex-1">
              <h2 className="font-bold text-lg text-ink">Enter our monthly giveaway?</h2>
              <p className="mt-1 text-sm text-ink/60">One winner gets 2 free drinks (any size), picked at the start of every month.</p>
              <label className="mt-3 flex items-center gap-3 cursor-pointer">
                <button
                  type="button"
                  role="switch"
                  aria-checked={giveawayOptIn}
                  onClick={() => setGiveawayOptIn((v) => !v)}
                  className={`relative w-11 h-6 shrink-0 rounded-full transition-colors ${giveawayOptIn ? "bg-berry" : "bg-ink/20"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${giveawayOptIn ? "translate-x-5" : ""}`} />
                </button>
                <span className="text-sm font-medium text-ink">Yes, enter me in this month&apos;s giveaway</span>
              </label>
              <p className="mt-2 text-xs text-ink/50">
                No purchase necessary, anyone can{" "}
                <Link href="/giveaway" target="_blank" className="underline hover:text-berry">
                  enter for free
                </Link>
                .{" "}
                <Link href="/giveaway/rules" target="_blank" className="underline hover:text-berry">
                  Official rules
                </Link>
              </p>
            </div>
          </section>
        </div>

        {/* Summary */}
        <aside className={`${card} lg:sticky lg:top-28 flex flex-col gap-4`}>
          <h2 className="font-bold text-xl text-ink">Order Summary</h2>

          {appliedGift ? (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-blush bg-white px-4 py-3">
              <div className="text-sm">
                <p className="font-semibold text-ink">Gift card {appliedGift.code}</p>
                <p className="text-xs text-ink/50">Balance: {appliedGift.balanceLabel}</p>
              </div>
              <button type="button" onClick={() => setGiftCard(null)} className="text-xs font-semibold text-ink/50 hover:text-berry">
                Remove
              </button>
            </div>
          ) : (
            <div>
              <div className="flex gap-2">
                <input
                  value={giftCodeInput}
                  onChange={(e) => setGiftCodeInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applyGiftCard()}
                  placeholder="Gift card code"
                  aria-label="Gift card code"
                  className={`${inputClass} uppercase tracking-wider placeholder:normal-case placeholder:tracking-normal`}
                />
                <button
                  type="button"
                  onClick={applyGiftCard}
                  disabled={applyingGift || !giftCodeInput.trim()}
                  className="shrink-0 rounded-xl border border-wine text-wine font-semibold px-4 text-sm hover:bg-wine hover:text-white disabled:opacity-40 transition-colors"
                >
                  {applyingGift ? "..." : "Apply"}
                </button>
              </div>
              {giftError && <p className="mt-1.5 text-xs text-red-600">{giftError}</p>}
              {giftCard && !appliedGift && <p className="mt-1.5 text-xs text-ink/50">Your order changed, please apply your gift card again.</p>}
            </div>
          )}

          <dl className="flex flex-col gap-2 text-ink/80">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{formatCents(totalCents)}</dd>
            </div>
            {appliedGift && (
              <div className="flex justify-between">
                <dt>Gift card</dt>
                <dd>&minus;{formatCents(appliedGift.discountCents)}</dd>
              </div>
            )}
            {cardFeeCents > 0 && (
              <div className="flex justify-between">
                <dt>Card processing fee</dt>
                <dd>{formatCents(cardFeeCents)}</dd>
              </div>
            )}
          </dl>
          <div className="flex items-baseline justify-between border-t border-blush pt-4">
            <span className="text-xl font-bold text-ink">Total</span>
            <span className="text-2xl font-bold text-ink">{formatCents(amountDueCents)}</span>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            onClick={submitOnlinePayment}
            disabled={submitting || paused}
            className="rounded-full bg-wine hover:bg-wine-dark disabled:opacity-60 text-white font-semibold px-6 py-4 shadow-lg shadow-wine/20 transition-colors"
          >
            {paused
              ? `Ordering unavailable until ${backAt}`
              : submitting
                ? amountDueCents === 0
                  ? "Placing your order..."
                  : "Redirecting to payment..."
                : amountDueCents === 0
                  ? "Place Order"
                  : `Pay with Card · ${formatCents(amountDueCents)}`}
          </button>
          <p className="text-xs text-ink/50 text-center">
            {amountDueCents === 0 ? "Your gift card covers this whole order." : "Secure payment by Stripe. Your order is ready to grab when you get here."}
          </p>
        </aside>
      </div>
    </div>
  );
}
