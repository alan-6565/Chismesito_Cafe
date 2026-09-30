"use client";

import { ReactNode } from "react";
import Image from "next/image";
import { useCart, summarizeCartLine } from "@/lib/cart-context";
import { formatCents } from "@/lib/money";
import Logo from "./Logo";
import { StoreIcon, TrashIcon } from "./icons";

// "Your Order" card shared by the /menu sidebar and the /checkout summary, so
// the cart looks and behaves the same in both places.
export default function OrderPanel({ children }: { children?: ReactNode }) {
  const { items, totalItems, totalCents, updateQuantity, removeItem, clear } = useCart();

  return (
    <div className="rounded-3xl bg-cream-alt/70 border border-blush/60 p-5 flex flex-col">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display font-bold text-xl text-maroon">
          Your Order <span className="font-body font-normal text-base text-ink/60">({totalItems})</span>
        </h2>
        {items.length > 0 && (
          <button onClick={clear} className="text-xs text-rose underline hover:text-rose-dark">
            Clear all
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink/60">
          Your order is empty. Tap <span className="font-semibold text-rose">+</span> on a drink to add it.
        </p>
      ) : (
        <div className="mt-4 flex flex-col divide-y divide-blush">
          {items.map((item) => (
            <div key={item.cartLineId} className="flex gap-3 py-4 first:pt-0">
              <div className="relative w-16 h-20 shrink-0 rounded-xl overflow-hidden bg-blush-soft flex items-center justify-center">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                ) : (
                  <Logo size="md" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-display font-semibold text-sm text-maroon leading-snug">{item.name}</p>
                  <span className="text-sm font-semibold text-maroon shrink-0">
                    {formatCents(item.unitPriceCents * item.quantity)}
                  </span>
                </div>
                {summarizeCartLine(item) && (
                  <p className="text-[11px] text-ink/55 leading-snug">
                    {summarizeCartLine(item).replaceAll(", ", " · ")}
                  </p>
                )}
                {item.notes && <p className="text-[11px] text-ink/50 italic truncate">Note: {item.notes}</p>}
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.cartLineId, item.quantity - 1)}
                      aria-label={`Decrease ${item.name} quantity`}
                      className="w-7 h-7 rounded-full border border-maroon/25 bg-white text-maroon flex items-center justify-center hover:bg-blush-soft"
                    >
                      &minus;
                    </button>
                    <span className="w-4 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.cartLineId, item.quantity + 1)}
                      aria-label={`Increase ${item.name} quantity`}
                      className="w-7 h-7 rounded-full border border-maroon/25 bg-white text-maroon flex items-center justify-center hover:bg-blush-soft"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.cartLineId)}
                    aria-label={`Remove ${item.name}`}
                    className="text-maroon/60 hover:text-rose"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-2 pt-4 border-t border-blush flex items-center justify-between text-sm">
        <span className="text-ink/70">Subtotal</span>
        <span className="font-semibold text-maroon">{formatCents(totalCents)}</span>
      </div>

      {children}

      <div className="mt-4 rounded-2xl bg-white/70 border border-blush/60 p-4 flex gap-3">
        <StoreIcon className="w-6 h-6 text-rose shrink-0" />
        <div>
          <p className="text-sm font-semibold text-maroon">Pickup Order</p>
          <p className="text-xs text-ink/60 leading-snug">
            Online orders are ready for in-store pickup. Want delivery? Find us on DoorDash.
          </p>
        </div>
      </div>
    </div>
  );
}
