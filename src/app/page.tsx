import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import HomeHero from "@/components/HomeHero";
import Reveal from "@/components/Reveal";
import SeasonalSky from "@/components/SeasonalSky";
import ChismeTicker from "@/components/home/ChismeTicker";
import SeasonBoards from "@/components/home/SeasonBoards";
import ChismeCorner from "@/components/home/ChismeCorner";
import HoursBoard from "@/components/home/HoursBoard";
import { InstagramIcon } from "@/components/icons";
import { business } from "@/lib/data";
import { getMenu } from "@/lib/menu";
import { formatMonth, giveawayMonth } from "@/lib/giveaway";

export const revalidate = 0;

const line = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

// The four shortcuts under the banner in the mockup
const tiles = [
  {
    href: "/menu",
    title: "Order Online",
    text: "Quick & easy",
    icon: (
      <svg viewBox="0 0 32 32" className="w-9 h-9" {...line}>
        <path d="M5 11h18v7a7 7 0 0 1-7 7h-4a7 7 0 0 1-7-7v-7ZM23 13h2a3 3 0 0 1 0 6h-2M4 28h22" />
        <path d="M13 15.5c-1.3-1.8-4-.6-2.7 1.3L13 19.5l2.7-2.7c1.3-1.9-1.4-3.1-2.7-1.3Z" />
      </svg>
    ),
  },
  {
    href: "/giveaway",
    title: "Rewards",
    text: "Monthly giveaway",
    icon: (
      <svg viewBox="0 0 32 32" className="w-9 h-9" {...line}>
        <path d="M5 12h22v5H5zM7 17h18v11H7zM16 12v16M16 12c-2-5-8-5-7-1 .5 1.5 4 1 7 1Zm0 0c2-5 8-5 7-1-.5 1.5-4 1-7 1Z" />
      </svg>
    ),
  },
  {
    href: "/giveaway",
    title: "Giveaway",
    text: "Win 2 free drinks",
    icon: (
      <svg viewBox="0 0 32 32" className="w-9 h-9" {...line}>
        <path d="M9 5h14v6a7 7 0 0 1-14 0V5ZM9 7H5a4 4 0 0 0 4 6M23 7h4a4 4 0 0 1-4 6M16 18v5M11 27h10l-1-4h-8l-1 4Z" />
        <path d="M16 9.5c-.9-1.2-2.7-.4-1.8.9L16 12.2l1.8-1.8c.9-1.3-.9-2.1-1.8-.9Z" />
      </svg>
    ),
  },
  {
    href: "/contact",
    title: "Visit Us",
    text: `${business.city}, ${business.state}`,
    icon: (
      <svg viewBox="0 0 32 32" className="w-9 h-9" {...line}>
        <path d="M16 29s9-8.4 9-15.5a9 9 0 0 0-18 0C7 20.6 16 29 16 29Z" />
        <circle cx="16" cy="13.5" r="3.2" />
      </svg>
    ),
  },
];

export default async function Home() {
  const items = await getMenu();
  const loved = items.filter((i) => i.featured).slice(0, 10);
  const month = formatMonth(giveawayMonth()).split(" ")[0];

  return (
    <div>
      <h2 className="sr-only">{business.tagline}</h2>
      <div className="relative">
        <HomeHero month={month} />
        <SeasonalSky density={0.7} />
      </div>

      <ChismeTicker />

      {/* Shortcuts */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 -mt-1 pt-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {tiles.map((t, i) => (
            <Reveal key={t.title} delay={i * 80}>
              <Link
                href={t.href}
                className="group card-soft flex flex-col items-center gap-1.5 px-4 py-6 text-center text-wine transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_34px_-14px_rgba(126,21,51,.35)]"
              >
                <span className="grid place-items-center w-16 h-16 rounded-full bg-blush-soft transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                  {t.icon}
                </span>
                <span className="mt-1 font-bold text-ink">{t.title}</span>
                <span className="text-xs text-ink/60">{t.text}</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <SeasonBoards items={items} />

      {/* Most loved */}
      {loved.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-16">
          <Reveal className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-berry">Fan favorites</p>
              <h2 className="mt-1 font-display font-bold text-3xl sm:text-4xl text-wine-dark">
                Our Most Loved Drinks <span className="text-berry">♡</span>
              </h2>
            </div>
            <Link href="/menu" className="shrink-0 text-sm font-semibold text-berry hover:text-berry-dark">
              See full menu ›
            </Link>
          </Reveal>
          {/* A swipeable shelf of favorites */}
          <div className="mt-6 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 flex gap-4 sm:gap-5 overflow-x-auto snap-x snap-mandatory pb-4 [scrollbar-width:thin]">
            {loved.map((item, i) => (
              <Reveal key={item.id} delay={i * 90} className="snap-start shrink-0 w-[46%] sm:w-[31%] lg:w-[23.5%]">
                <ProductCard item={item} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <ChismeCorner />

      {/* Visit — storefront photo + the hours sign (live data, never baked into an image) */}
      <section id="visit" className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1.15fr_1fr] gap-8 items-center">
          <Reveal className="relative">
            <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-[0_24px_50px_-20px_rgba(70,10,20,.45)]">
              <Image
                src="/images/storefront.png"
                alt="Chismesito Cafe storefront in Richmond, CA"
                fill
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-wine-dark/85 via-wine-dark/10 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8 text-white">
                <p className="font-script text-3xl text-[#ffe3b8]">Ven a visitarnos</p>
                <h2 className="font-display font-bold text-3xl sm:text-4xl">Richmond, CA</h2>
                <p className="mt-1 text-white/85">{business.address}</p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Link
                    href="/contact"
                    className="rounded-full bg-white text-wine-dark text-sm font-semibold px-5 py-2.5 hover:bg-cream transition-colors"
                  >
                    Get Directions
                  </Link>
                  <a
                    href={business.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border-2 border-white/80 p-2.5 hover:bg-white hover:text-wine-dark transition-colors"
                    aria-label="Follow us on Instagram"
                  >
                    <InstagramIcon className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={150}>
            <HoursBoard />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
