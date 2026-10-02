"use client";

import { useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import OrderPanel from "@/components/OrderPanel";
import { CupIcon, GridIcon, HeartIcon, IcedCupIcon, LeafIcon, PastryIcon, StarIcon } from "@/components/icons";
import { useCart } from "@/lib/cart-context";
import { formatCents } from "@/lib/money";
import type { MenuItemFull } from "@/lib/menu";

const FEATURED = "Featured";
const ALL = "Full Menu";

function CategoryIcon({ category, className }: { category: string; className: string }) {
  if (category === FEATURED) return <StarIcon className={className} />;
  if (category === ALL) return <GridIcon className={className} />;
  if (/signature/i.test(category)) return <HeartIcon className={className} />;
  if (/matcha|chai/i.test(category)) return <LeafIcon className={className} />;
  if (/iced|refresher|juice|sago/i.test(category)) return <IcedCupIcon className={className} />;
  if (/pastr|snack/i.test(category)) return <PastryIcon className={className} />;
  return <CupIcon className={className} />;
}

const headings: Record<string, { eyebrow: string; title: string; subtitle: string }> = {
  [FEATURED]: {
    eyebrow: "Featured",
    title: "Our Most Loved Drinks",
    subtitle: "Handcrafted with care, community and a whole lot of chisme.",
  },
  [ALL]: {
    eyebrow: "Full Menu",
    title: "Everything We Make",
    subtitle: "Handcrafted daily.",
  },
};

export default function MenuBrowser({
  items,
  categories,
}: {
  items: MenuItemFull[];
  categories: string[];
}) {
  const hasFeatured = items.some((i) => i.featured);
  const tabs = [...(hasFeatured ? [FEATURED] : []), ALL, ...categories];
  const [active, setActive] = useState<string>(tabs[0]);
  const { items: cartItems, totalCents } = useCart();

  const visible =
    active === FEATURED
      ? items.filter((i) => i.featured)
      : active === ALL
        ? // Grouped by section (items arrive sorted by name) so the full
          // menu reads in the same order as the category tabs.
          [...items].sort((a, b) => categories.indexOf(a.category) - categories.indexOf(b.category))
        : items.filter((i) => i.category === active);

  const heading = headings[active] ?? {
    eyebrow: "Menu",
    title: active,
    subtitle: "Handcrafted daily.",
  };

  return (
    <div className="grid lg:grid-cols-[210px_minmax(0,1fr)_320px] gap-6 xl:gap-8">
      {/* Category sidebar (desktop) */}
      <aside className="hidden lg:block">
        <nav className="sticky top-24 flex flex-col gap-1">
          {tabs.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-left transition-colors ${
                active === c
                  ? "bg-maroon text-cream font-semibold"
                  : "text-maroon hover:bg-blush-soft"
              }`}
            >
              <CategoryIcon category={c} className="w-5 h-5 shrink-0" />
              {c}
            </button>
          ))}
          <p className="mt-8 pt-6 border-t border-blush font-script text-2xl leading-tight text-rose -rotate-6 text-center">
            Coffee, Good Vibes
            <br />& a Little Chisme ♡
          </p>
        </nav>
      </aside>

      <section className="min-w-0">
        {/* Category chips (mobile/tablet) */}
        <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 mb-6">
          {tabs.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`shrink-0 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                active === c
                  ? "bg-maroon text-cream"
                  : "bg-white text-maroon border border-blush hover:bg-blush-soft"
              }`}
            >
              <CategoryIcon category={c} className="w-4 h-4" />
              {c}
            </button>
          ))}
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose">{heading.eyebrow}</p>
        <h1 className="mt-1 font-display font-bold text-3xl sm:text-4xl text-maroon">{heading.title}</h1>
        <p className="mt-2 text-ink/60">{heading.subtitle}</p>

        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
          {visible.map((item) => (
            <ProductCard key={item.id} item={item} layout="row" />
          ))}
        </div>
      </section>

      {/* Order sidebar (desktop) */}
      <aside className="hidden lg:block">
        <div className="sticky top-24">
          <OrderPanel>
            <Link
              href="/checkout"
              aria-disabled={cartItems.length === 0}
              className={`mt-4 rounded-full text-center font-semibold px-5 py-3.5 text-sm transition-colors ${
                cartItems.length === 0
                  ? "bg-ink/15 text-ink/40 pointer-events-none"
                  : "bg-rose hover:bg-rose-dark text-white shadow-sm"
              }`}
            >
              Checkout · {formatCents(totalCents)} ›
            </Link>
          </OrderPanel>
          <p className="mt-6 font-script text-2xl text-rose text-center -rotate-6">Un Cafecito Para Todo ♡</p>
        </div>
      </aside>
    </div>
  );
}
