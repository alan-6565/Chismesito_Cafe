"use client";

import { useEffect, useRef, useState } from "react";
import FloralCorner from "@/components/FloralCorner";
import ProductCard from "@/components/ProductCard";
import { SearchIcon, StarIcon } from "@/components/icons";
import type { MenuItemFull } from "@/lib/menu";

const FEATURED = "Featured";
const ALL = "Full Menu";
const SORTS = { menu: "Menu order", low: "Price: low to high", high: "Price: high to low", az: "A to Z" } as const;
type Sort = keyof typeof SORTS;

const plain = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default function MenuBrowser({ items, categories }: { items: MenuItemFull[]; categories: string[] }) {
  const hasFeatured = items.some((i) => i.featured);
  const tabs = [...(hasFeatured ? [FEATURED] : []), ALL, ...categories];
  const [active, setActive] = useState<string>(tabs[0]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("menu");
  const [sortOpen, setSortOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // The navbar's search icon links here with ?search=1
  useEffect(() => {
    if (new URLSearchParams(location.search).get("search")) searchRef.current?.focus();
  }, []);

  const q = plain(query.trim());
  const base = q
    ? items.filter((i) => plain(`${i.name} ${i.description} ${i.category}`).includes(q))
    : active === FEATURED
      ? items.filter((i) => i.featured)
      : active === ALL
        ? [...items].sort((a, b) => categories.indexOf(a.category) - categories.indexOf(b.category))
        : items.filter((i) => i.category === active);
  const visible =
    sort === "menu"
      ? base
      : [...base].sort((a, b) =>
          sort === "az" ? a.name.localeCompare(b.name) : sort === "low" ? a.startingPriceCents - b.startingPriceCents : b.startingPriceCents - a.startingPriceCents
        );

  return (
    <div>
      {/* Heading with the flower corner from the mockup */}
      <div className="relative">
        <FloralCorner className="hidden sm:block absolute -right-4 sm:-right-8 -top-10 w-40 sm:w-64" />
        <p className="relative text-sm font-bold uppercase tracking-[0.18em] text-wine">Our Menu</p>
        <h1 className="relative mt-1 font-display font-bold text-4xl sm:text-5xl text-wine-dark">Drinks, Pastries &amp; More</h1>
        <p className="relative mt-2 text-ink/70 sm:text-lg">Handcrafted drinks, fresh pastries, and a whole lot of chisme.</p>
      </div>

      {/* Category pills */}
      <div className="mt-6 flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none]">
        {tabs.map((c) => {
          const on = active === c && !q;
          return (
            <button
              key={c}
              onClick={() => {
                setActive(c);
                setQuery("");
              }}
              className={`shrink-0 flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors shadow-sm ${
                on ? "bg-wine text-white shadow-wine/25" : "bg-white text-ink hover:text-berry border border-blush/60"
              }`}
            >
              {c === FEATURED && <StarIcon className="w-4 h-4" />}
              {c}
            </button>
          );
        })}
      </div>

      {/* Search + sort */}
      <div className="mt-4 flex gap-3">
        <label className="relative flex-1">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/50" />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search our menu..."
            aria-label="Search our menu"
            className="w-full rounded-full bg-white border border-blush/60 shadow-sm pl-12 pr-5 py-3.5 text-sm focus:outline-none focus:border-berry"
          />
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setSortOpen((o) => !o)}
            aria-label="Sort the menu"
            aria-expanded={sortOpen}
            className={`w-[52px] h-full rounded-2xl bg-white border shadow-sm flex items-center justify-center transition-colors ${sort !== "menu" ? "border-berry text-berry" : "border-blush/60 text-ink"}`}
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
              <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
              <circle cx="16" cy="7" r="2" />
              <circle cx="10" cy="17" r="2" />
            </svg>
          </button>
          {sortOpen && (
            <div className="absolute right-0 top-full mt-2 z-20 w-52 rounded-2xl bg-white border border-blush shadow-xl py-1">
              {(Object.keys(SORTS) as Sort[]).map((k) => (
                <button
                  key={k}
                  onClick={() => {
                    setSort(k);
                    setSortOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blush-soft ${sort === k ? "font-semibold text-berry" : "text-ink"}`}
                >
                  {sort === k ? "✓ " : ""}
                  {SORTS[k]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {q && (
        <p className="mt-6 text-sm text-ink/60">
          {visible.length} result{visible.length === 1 ? "" : "s"} for &ldquo;{query.trim()}&rdquo;
        </p>
      )}

      {visible.length === 0 ? (
        <p className="mt-10 text-center text-ink/60">Nothing matches that yet. Try another word ♡</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {visible.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
