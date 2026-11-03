"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Logo from "./Logo";
import ProductOptionsModal from "./ProductOptionsModal";
import { formatCents } from "@/lib/money";
import type { MenuItemFull } from "@/lib/menu";

const badgeStyles: Record<string, string> = {
  New: "bg-emerald-600",
  Popular: "bg-berry",
  Seasonal: "bg-wine",
};

const FAV_KEY = "chismesito-favorites";
const readFavs = (): string[] => {
  try {
    const v = JSON.parse(localStorage.getItem(FAV_KEY) ?? "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};

// The mockup's menu card: photo on top with a heart, name, price and a round
// + that opens the options. Hearts are remembered on this device only.
export default function ProductCard({ item }: { item: MenuItemFull; layout?: "stacked" | "row" }) {
  const [open, setOpen] = useState(false);
  const [fav, setFav] = useState(false);
  const soldOut = !item.available;

  useEffect(() => {
    const t = setTimeout(() => setFav(readFavs().includes(item.slug)), 0);
    return () => clearTimeout(t);
  }, [item.slug]);

  const toggleFav = () => {
    const next = fav ? readFavs().filter((s) => s !== item.slug) : [...readFavs(), item.slug];
    setFav(!fav);
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify(next));
    } catch {}
  };

  return (
    <>
      <div className="group relative card-soft overflow-hidden flex flex-col transition-transform duration-300 hover:-translate-y-1">
        <button
          type="button"
          onClick={() => !soldOut && setOpen(true)}
          aria-label={`Customize ${item.name}`}
          className="relative aspect-[4/3.2] w-full overflow-hidden bg-gradient-to-br from-blush-soft to-blush"
        >
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center">
              <Logo size="lg" />
            </span>
          )}
          {item.badge && (
            <span className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wide text-white rounded-full px-2.5 py-1 ${badgeStyles[item.badge] ?? "bg-wine"}`}>
              {item.badge}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={toggleFav}
          aria-pressed={fav}
          aria-label={fav ? `Remove ${item.name} from favorites` : `Save ${item.name} to favorites`}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 shadow flex items-center justify-center text-berry active:scale-90 transition-transform"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill={fav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="M12 20s-7.5-4.6-9.8-9.2C.7 7.4 2.6 4 6.2 4c2 0 3.4 1 5.8 3.5C14.4 5 15.8 4 17.8 4c3.6 0 5.5 3.4 4 6.8C19.5 15.4 12 20 12 20Z" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="px-4 pt-3 pb-4 flex flex-1 flex-col">
          <h3 className="font-bold text-ink leading-snug line-clamp-2">{item.name}</h3>
          <div className="mt-auto pt-2 flex items-center justify-between gap-2">
            <span className="font-bold text-ink">{formatCents(item.startingPriceCents)}</span>
            {soldOut ? (
              <span className="rounded-full bg-ink/10 text-ink/50 text-xs font-semibold px-3 py-1.5">Sold Out</span>
            ) : (
              <button
                onClick={() => setOpen(true)}
                aria-label={`Add ${item.name}`}
                className="w-9 h-9 rounded-full bg-berry hover:bg-berry-dark text-white text-2xl leading-none flex items-center justify-center shadow-md shadow-berry/30 transition-colors"
              >
                +
              </button>
            )}
          </div>
        </div>
      </div>
      {open && <ProductOptionsModal item={item} onClose={() => setOpen(false)} />}
    </>
  );
}
