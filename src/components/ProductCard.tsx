"use client";

import { useState } from "react";
import Image from "next/image";
import ProductOptionsModal from "./ProductOptionsModal";
import { formatCents } from "@/lib/money";
import type { MenuItemFull } from "@/lib/menu";

const badgeStyles: Record<string, string> = {
  New: "bg-emerald-600",
  Popular: "bg-rose",
  Seasonal: "bg-blush-soft text-maroon border border-rose",
};

export default function ProductCard({ item }: { item: MenuItemFull }) {
  const [open, setOpen] = useState(false);
  const soldOut = !item.available;

  const badge = item.badge && (
    <span
      className={`text-[10px] font-semibold uppercase tracking-wide text-white rounded-full px-2 py-1 ${badgeStyles[item.badge] ?? "bg-maroon"}`}
    >
      {item.badge}
    </span>
  );

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
      {open && <ProductOptionsModal item={item} onClose={() => setOpen(false)} />}
    </>
  );
}
