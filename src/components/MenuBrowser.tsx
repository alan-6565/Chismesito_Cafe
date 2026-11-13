"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Reveal from "@/components/Reveal";
import SeasonalSky from "@/components/SeasonalSky";
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
  // ?category=Holiday%20Menu (from the home page boards) opens that tab
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("search")) searchRef.current?.focus();
    const cat = params.get("category");
    if (!cat || !categories.includes(cat)) return;
    const t = setTimeout(() => setActive(cat), 0);
    return () => clearTimeout(t);
  }, [categories]);

  const q = plain(query.trim());
  const base = q
    ? items.filter((i) => plain(`${i.name} ${i.description} ${i.category}`).includes(q))
    : active === FEATURED
      ? items.filter((i) => i.featured)
      : active === ALL
        ? [...items].sort((a, b) => categories.indexOf(a.category) - categories.indexOf(b.category))
        : items.filter((i) => i.category === active);

  const seasonal = categories.filter((c) => /holiday|fall/i.test(c));
  const pick = (c: string) => {
    setActive(c);
    setQuery("");
  };
  const sortList = (list: MenuItemFull[]) =>
    sort === "menu"
      ? list
      : [...list].sort((a, b) =>
          sort === "az" ? a.name.localeCompare(b.name) : sort === "low" ? a.startingPriceCents - b.startingPriceCents : b.startingPriceCents - a.startingPriceCents
        );
  const grouped = active === ALL && !q;
  const visible = sortList(base);

  return (
    <div>
      {/* Poster-style header: seasonal stripes around an arched cream card */}
      <div
        className="relative overflow-hidden rounded-[2rem] poster-stripes px-3 pt-6 sm:px-6 sm:pt-8"
        style={{ "--ps-a": "var(--stripe-a)", "--ps-b": "var(--stripe-b)" } as CSSProperties}
      >
        <SeasonalSky density={0.5} />
        <div className="relative z-10 mx-auto max-w-3xl bg-[#fdf5ea] px-6 pt-10 pb-8 text-center [border-radius:999px_999px_0_0/180px_180px_0_0] shadow-[0_-10px_30px_-12px_rgba(70,10,20,.35)]">
          <div aria-hidden className="pointer-events-none absolute inset-2.5 bottom-0 border-[1.5px] border-b-0 border-wine/30 [border-radius:999px_999px_0_0/170px_170px_0_0]" />
          <p className="relative text-[11px] sm:text-xs font-semibold tracking-[0.35em] uppercase text-wine/80">Chismesito · Cafe</p>
          <h1 className="relative font-script font-bold text-6xl sm:text-7xl text-wine-dark leading-none mt-1">Our Menu</h1>
          <p className="relative mt-3 text-ink/70 sm:text-lg">Handcrafted drinks, fresh pastries, and a whole lot of chisme.</p>
          {seasonal.length > 0 && (
            <div className="relative mt-5 flex flex-wrap justify-center gap-2.5">
              {seasonal.map((c) => (
                <button
                  key={c}
                  onClick={() => pick(c)}
                  className="group inline-flex items-center gap-2 rounded-full bg-white border border-blush px-4 py-2 text-sm font-semibold text-wine-dark shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all"
                >
                  <span className="transition-transform duration-500 group-hover:rotate-180">{/holiday/i.test(c) ? "❄" : "🍁"}</span>
                  New: {c}
                  <span className="text-berry">→</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category pills — stick under the navbar while you scroll */}
      <div className="sticky top-24 z-30 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 py-3 bg-cream/90 backdrop-blur-md border-b border-blush/50">
        <div className="flex gap-2.5 overflow-x-auto [scrollbar-width:none]">
          {tabs.map((c) => {
            const on = active === c && !q;
            const holiday = /holiday/i.test(c);
            const fall = /fall/i.test(c);
            return (
              <button
                key={c}
                onClick={() => pick(c)}
                aria-pressed={on}
                className={`shrink-0 flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
                  on
                    ? "bg-wine text-white shadow-md shadow-wine/25 scale-[1.03]"
                    : holiday
                      ? "bg-white text-[#8e1a24] border-2 border-[#8e1a24]/40 hover:border-[#8e1a24]"
                      : fall
                        ? "bg-white text-[#9a5a22] border-2 border-[#d99b4e]/50 hover:border-[#d99b4e]"
                        : "bg-white text-ink hover:text-berry border border-blush/60"
                }`}
              >
                {c === FEATURED && <StarIcon className="w-4 h-4" />}
                {holiday && <span aria-hidden>❄</span>}
                {fall && <span aria-hidden>🍁</span>}
                {c}
              </button>
            );
          })}
        </div>
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
      ) : grouped ? (
        // Full Menu: one labeled shelf per category
        <div className="mt-4">
          {categories.map((c) => {
            const list = sortList(items.filter((i) => i.category === c));
            if (!list.length) return null;
            return (
              <section key={c} className="pt-10 scroll-mt-40" id={c.toLowerCase().replace(/[^a-z]+/g, "-")}>
                <Reveal className="flex items-center gap-4">
                  <h2 className="font-display font-bold text-2xl sm:text-3xl text-wine-dark whitespace-nowrap">{c}</h2>
                  <span className="h-px flex-1 bg-gradient-to-r from-wine/30 to-transparent" />
                  <button onClick={() => pick(c)} className="shrink-0 text-sm font-semibold text-berry hover:text-berry-dark">
                    {list.length} items ›
                  </button>
                </Reveal>
                <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                  {list.map((item, i) => (
                    <Reveal key={item.id} delay={(i % 4) * 70}>
                      <ProductCard item={item} />
                    </Reveal>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div key={`${active}-${q}-${sort}`} className="mt-6 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {visible.map((item, i) => (
            <Reveal key={item.id} delay={Math.min(i, 8) * 60}>
              <ProductCard item={item} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
