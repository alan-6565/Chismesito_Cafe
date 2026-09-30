"use client";

import { useState } from "react";
import Image from "next/image";
import Logo from "./Logo";
import ProductOptionsModal from "./ProductOptionsModal";
import { formatCents } from "@/lib/money";
import type { MenuItemFull } from "@/lib/menu";

const badgeStyles: Record<string, string> = {
  New: "bg-emerald-600",
  Popular: "bg-rose",
  Seasonal: "bg-blush-soft text-maroon border border-rose",
};

// "stacked" = photo on top (homepage Trending grid); "row" = photo on the
// left with a round + button (the /menu ordering grid).
export default function ProductCard({
  item,
  layout = "stacked",
}: {
  item: MenuItemFull;
  layout?: "stacked" | "row";
}) {
  const [open, setOpen] = useState(false);
  const soldOut = !item.available;

  const badge = item.badge && (
    <span
      className={`text-[10px] font-semibold uppercase tracking-wide text-white rounded-full px-2 py-1 ${badgeStyles[item.badge] ?? "bg-maroon"}`}
    >
      {item.badge}
    </span>
  );

  const modal = open && <ProductOptionsModal item={item} onClose={() => setOpen(false)} />;

  if (layout === "row") {
    return (
      <>
        <div className="rounded-2xl bg-white shadow-sm border border-blush/40 overflow-hidden flex min-h-44">
          <div className="relative w-32 sm:w-36 shrink-0 bg-gradient-to-br from-blush-soft to-blush flex items-center justify-center">
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                sizes="(min-width: 640px) 144px, 128px"
                className="object-cover"
              />
            ) : (
              <Logo size="lg" />
            )}
            {badge && <div className="absolute top-2 left-2">{badge}</div>}
          </div>
          <div className="p-4 flex flex-col gap-2 flex-1 min-w-0">
            <h3 className="font-display font-semibold text-maroon leading-snug">{item.name}</h3>
            <p className="text-xs text-ink/60 leading-relaxed flex-1">{item.description}</p>
            <div className="flex items-center justify-between pt-1">
              <span className="font-display font-semibold text-lg text-maroon">
                {formatCents(item.startingPriceCents)}
              </span>
              {soldOut ? (
                <span className="rounded-full bg-ink/10 text-ink/50 text-xs font-semibold px-3 py-1.5">
                  Sold Out
                </span>
              ) : (
                <button
                  onClick={() => setOpen(true)}
                  aria-label={`Add ${item.name}`}
                  className="w-9 h-9 rounded-full bg-rose hover:bg-rose-dark text-white text-xl leading-none flex items-center justify-center shadow-sm transition-colors"
                >
                  +
                </button>
              )}
            </div>
          </div>
        </div>
        {modal}
      </>
    );
  }

  return (
    <>
      <div className="rounded-2xl bg-white shadow-sm overflow-hidden flex flex-col">
        {item.imageUrl && (
          <div className="relative h-36 w-full">
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              sizes="(min-width: 1024px) 20vw, 45vw"
              className="object-cover"
            />
            {badge && <div className="absolute top-2 left-2">{badge}</div>}
          </div>
        )}
        <div className="p-4 flex flex-col gap-2 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display font-semibold text-maroon leading-snug">{item.name}</h3>
            {!item.imageUrl && badge}
          </div>
          <p className="text-xs text-ink/60 flex-1">{item.description}</p>
          <div className="flex items-center justify-between pt-1">
            <span className="font-semibold text-maroon">{formatCents(item.startingPriceCents)}</span>
            <button
              disabled={soldOut}
              onClick={() => setOpen(true)}
              className="rounded-full bg-rose hover:bg-rose-dark disabled:bg-ink/20 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-2 transition-colors"
            >
              {soldOut ? "Sold Out" : "Order Now"}
            </button>
          </div>
        </div>
      </div>
      {modal}
    </>
  );
}
