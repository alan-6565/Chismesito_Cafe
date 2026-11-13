import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import Reveal from "@/components/Reveal";
import { formatCents } from "@/lib/money";
import type { MenuItemFull } from "@/lib/menu";

// The seasonal menus drawn as arched boards — the same look the cafe uses on
// Instagram (striped background, arched cream card, script heading). The
// drinks come live from the menu, so adding/removing items in /admin/menu
// updates these too. A board hides itself when its category is empty.

type Drink = { name: string; description: string; fromCents: number };

// Same order as the cafe's posters; anything not listed goes after, A–Z.
const POSTER_ORDER = [
  "Peppermint Mocha Latte",
  "Peppermint White Mocha Latte",
  "S'mores Latte",
  "Tiramisu Latte",
  "Sugar Cookie Latte",
  "Sugar Cookie Matcha",
  "Sugar Cookie Chai",
  "Gingerbread Latte",
  "Gingerbread Chai",
  "Pumpkin Spice Iced Latte",
  "Pumpkin Spice Chai",
  "Tres Leches Pumpkin Spice",
  "Pumpkin Spice Matcha",
];
const rank = (n: string) => {
  const i = POSTER_ORDER.indexOf(n);
  return i === -1 ? POSTER_ORDER.length : i;
};

// Descriptions from the cafe's Fall Menu poster, for items saved without one.
const POSTER_NOTES: Record<string, string> = {
  "Pumpkin Spice Iced Latte": "Espresso, pumpkin spice & milk.",
  "Pumpkin Spice Chai": "Chai tea, pumpkin spice & milk.",
  "Tres Leches Pumpkin Spice": "Espresso, tres leches, pumpkin spice & milk.",
  "Pumpkin Spice Matcha": "Premium matcha, pumpkin spice & milk.",
};

/** Holiday drinks exist as "(Iced)" and "(Hot)" twins — show each once, from its lowest price. */
function collapse(items: MenuItemFull[]): Drink[] {
  const map = new Map<string, Drink>();
  for (const i of items) {
    if (!i.available) continue;
    const name = i.name.replace(/\s*\((Iced|Hot)\)\s*$/i, "").trim();
    const prev = map.get(name);
    if (!prev) map.set(name, { name, description: i.description || POSTER_NOTES[name] || "", fromCents: i.startingPriceCents });
    else {
      prev.fromCents = Math.min(prev.fromCents, i.startingPriceCents);
      if (!prev.description) prev.description = i.description;
    }
  }
  return [...map.values()].sort((a, b) => rank(a.name) - rank(b.name) || a.name.localeCompare(b.name));
}

function Snowflake({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
      <path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M9.5 3.8 12 6l2.5-2.2M9.5 20.2 12 18l2.5 2.2M4.6 10.4 5.5 7.2 2.4 6.2M19.4 13.6l-.9 3.2 3.1 1M19.4 10.4l-.9-3.2 3.1-1M4.6 13.6l.9 3.2-3.1 1" />
    </svg>
  );
}

function Maple({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <path fill="currentColor" d="M32 2 37 16l11-7-3 14 15-2-10 11 12 6-15 4 6 13-13-6-2 15-6-11-6 11-2-15-13 6 6-13-15-4 12-6L4 21l15 2-3-14 11 7Z" />
    </svg>
  );
}

function Board({
  stripes,
  ink,
  title,
  icon,
  drinks,
  footnote,
  href,
  cta,
  tilt,
}: {
  stripes: [string, string];
  ink: string;
  title: string;
  icon: ReactNode;
  drinks: Drink[];
  footnote: string;
  href: string;
  cta: string;
  tilt: number;
}) {
  return (
    <Link
      href={href}
      style={{ "--ps-a": stripes[0], "--ps-b": stripes[1], color: ink, "--tilt": `${tilt}deg` } as CSSProperties}
      className="group block rounded-[2rem] poster-stripes p-4 sm:p-6 shadow-[0_24px_50px_-20px_rgba(70,10,20,.45)] transition-transform duration-500 [transform:rotate(var(--tilt))] hover:[transform:rotate(0deg)_translateY(-6px)]"
    >
      {/* The arched cream card with a thin double rule, like the posters */}
      <div className="relative bg-[#fdf5ea] px-5 sm:px-8 pt-12 pb-7 [border-radius:999px_999px_1.25rem_1.25rem/200px_200px_1.25rem_1.25rem] shadow-inner">
        <div aria-hidden className="pointer-events-none absolute inset-2 border-[1.5px] border-current/45 [border-radius:999px_999px_.9rem_.9rem/190px_190px_.9rem_.9rem]" />
        <div className="relative text-center">
          <p className="text-[11px] font-semibold tracking-[0.35em] uppercase opacity-80">Chismesito · Cafe</p>
          <div className="mt-1 flex items-center justify-center gap-3">
            <span className="w-7 h-7 opacity-90 transition-transform duration-700 group-hover:rotate-180">{icon}</span>
            <h3 className="font-script font-bold text-5xl sm:text-6xl leading-none">{title}</h3>
            <span className="w-7 h-7 opacity-90 transition-transform duration-700 group-hover:-rotate-180">{icon}</span>
          </div>
          <div className="mx-auto mt-3 flex items-center gap-3 max-w-xs">
            <span className="h-px flex-1 bg-current/50" />
            <span aria-hidden>♡</span>
            <span className="h-px flex-1 bg-current/50" />
          </div>
        </div>

        <ul className="relative mt-4 space-y-3">
          {drinks.map((d, i) => (
            <Reveal as="li" key={d.name} delay={i * 60} className="text-center">
              <span className="block font-display font-bold uppercase tracking-wide text-[15px] sm:text-base leading-tight">{d.name}</span>
              <span className="mt-0.5 block text-[13px] text-ink/70 leading-snug">
                {d.description ? `${d.description} · ` : ""}
                <span className="font-semibold" style={{ color: ink }}>
                  from {formatCents(d.fromCents)}
                </span>
              </span>
            </Reveal>
          ))}
        </ul>

        <p className="relative mt-5 text-center text-xs tracking-wide text-ink/60">{footnote}</p>
        <div className="relative mt-4 flex justify-center">
          <span
            className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform group-hover:scale-105"
            style={{ background: ink }}
          >
            {cta} →
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function SeasonBoards({ items }: { items: MenuItemFull[] }) {
  const holiday = collapse(items.filter((i) => i.category === "Holiday Menu"));
  const fall = collapse(items.filter((i) => i.category === "Fall Menu"));
  if (!holiday.length && !fall.length) return null;
  const both = holiday.length > 0 && fall.length > 0;

  return (
    <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-6">
      <Reveal className="text-center">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[color:var(--season-accent)]">Now pouring</p>
        <h2 className="mt-1 font-display font-bold text-3xl sm:text-5xl text-wine-dark">This Season&apos;s Menus</h2>
        <p className="mt-2 text-ink/70">Limited-time drinks — get them before they&apos;re gone ♡</p>
      </Reveal>

      <div className={`mt-10 grid gap-10 lg:gap-12 ${both ? "lg:grid-cols-2" : "max-w-xl mx-auto"} items-start`}>
        {holiday.length > 0 && (
          <Reveal>
            <Board
              stripes={["#8e1a24", "#fbeee4"]}
              ink="#8e1a24"
              title="Holiday Menu"
              icon={<Snowflake className="w-full h-full" />}
              drinks={holiday}
              footnote="Hot 12 & 16 oz · Iced 16, 20 & 24 oz"
              href={`/menu?category=${encodeURIComponent("Holiday Menu")}`}
              cta="Order Holiday Drinks"
              tilt={-1.2}
            />
          </Reveal>
        )}
        {fall.length > 0 && (
          <Reveal delay={150}>
            <Board
              stripes={["#efd2a6", "#fbf0de"]}
              ink="#9a5a22"
              title="Fall Menu"
              icon={<Maple className="w-full h-full" />}
              drinks={fall}
              footnote="Pumpkin cold foam +$0.50 · Iced in 16, 20 & 24 oz"
              href={`/menu?category=${encodeURIComponent("Fall Menu")}`}
              cta="Order Fall Drinks"
              tilt={1.2}
            />
          </Reveal>
        )}
      </div>
    </section>
  );
}
