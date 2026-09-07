"use client";

import Link from "next/link";
import { useCart, summarizeCartLine } from "@/lib/cart-context";
import { formatCents } from "@/lib/money";

export default function CartDrawer() {
  const { items, isOpen, close, updateQuantity, removeItem, totalCents } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        aria-label="Close cart"
        onClick={close}
        className="absolute inset-0 bg-ink/40"
      />
      <div className="relative w-full max-w-sm h-full bg-cream shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-blush">
          <h2 className="font-display font-bold text-lg text-maroon">Your Cart</h2>
          <button onClick={close} aria-label="Close cart" className="text-2xl text-maroon leading-none">
            &times;
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-sm text-ink/60 px-5 text-center">
            Your cart is empty. Add something delicious from the menu!
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
            {items.map((item) => (
              <div key={item.cartLineId} className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-maroon text-sm truncate">
                    {item.name}
                  </p>
                  {summarizeCartLine(item) && (
                    <p className="text-[11px] text-ink/50 truncate">{summarizeCartLine(item)}</p>
                  )}
                  {item.notes && (
                    <p className="text-[11px] text-ink/50 italic truncate">Note: {item.notes}</p>
                  )}
                  <p className="text-xs text-ink/60">{formatCents(item.unitPriceCents)} each</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => updateQuantity(item.cartLineId, item.quantity - 1)}
                    className="w-7 h-7 rounded-full border border-blush text-maroon flex items-center justify-center hover:bg-blush-soft"
                    aria-label={`Decrease ${item.name} quantity`}
                  >
                    &minus;
                  </button>
                  <span className="w-5 text-center text-sm">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.cartLineId, item.quantity + 1)}
                    className="w-7 h-7 rounded-full border border-blush text-maroon flex items-center justify-center hover:bg-blush-soft"
                    aria-label={`Increase ${item.name} quantity`}
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.cartLineId)}
                  aria-label={`Remove ${item.name}`}
                  className="text-ink/40 hover:text-rose text-lg leading-none shrink-0"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-blush px-5 py-4 flex flex-col gap-3">
          <div className="flex items-center justify-between font-semibold text-maroon">
            <span>Total</span>
            <span>{formatCents(totalCents)}</span>
          </div>
          <Link
            href="/checkout"
            onClick={close}
            className={`rounded-full text-center font-semibold px-5 py-3 text-sm transition-colors ${
              items.length === 0
                ? "bg-ink/20 text-ink/50 pointer-events-none"
                : "bg-rose hover:bg-rose-dark text-white"
            }`}
          >
            Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
