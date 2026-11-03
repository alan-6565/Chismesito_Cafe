import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import HomeHero from "@/components/HomeHero";
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
  const loved = items.filter((i) => i.featured).slice(0, 8);
  const month = formatMonth(giveawayMonth()).split(" ")[0];

  return (
    <div>
      <h2 className="sr-only">{business.tagline}</h2>
      <HomeHero month={month} />

      {/* Shortcuts */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 -mt-4 md:mt-6">
        <div className="card-soft grid grid-cols-2 lg:grid-cols-4 lg:divide-x divide-blush">
          {tiles.map((t) => (
            <Link key={t.title} href={t.href} className="flex flex-col items-center gap-1.5 px-4 py-6 text-center text-wine hover:bg-blush-soft/50 transition-colors first:rounded-l-3xl last:rounded-r-3xl">
              {t.icon}
              <span className="mt-1 font-bold text-ink">{t.title}</span>
              <span className="text-xs text-ink/60">{t.text}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Most loved */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-wine-dark">
            Our Most Loved Drinks <span className="text-berry">♡</span>
          </h2>
          <Link href="/menu" className="shrink-0 text-sm font-semibold text-berry hover:text-berry-dark">
            See full menu ›
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {loved.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* Visit us strip — real, live data (address/hours), not baked into a
          graphic, so it can't go stale and reflows properly on mobile. */}
      <section id="visit" className="pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 rounded-3xl overflow-hidden shadow-sm">
            <div className="relative h-56 sm:h-auto">
              <Image
                src="/images/storefront.png"
                alt="Chismesito Cafe storefront in Richmond, CA"
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="bg-blush p-8 sm:p-10 flex flex-col justify-center gap-4">
              <h2 className="font-display font-bold text-2xl text-maroon">Visit Us in Richmond, CA</h2>
              <p className="text-ink/80">{business.address}</p>
              <p className="text-ink/80">{business.hours}</p>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <Link
                  href="/contact"
                  className="rounded-full bg-rose hover:bg-rose-dark text-white text-sm font-semibold px-5 py-2.5 transition-colors"
                >
                  Get Directions
                </Link>
                <a
                  href={business.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border-2 border-maroon text-maroon p-2.5 hover:bg-maroon hover:text-cream transition-colors"
                  aria-label="Follow us on Instagram"
                >
                  <InstagramIcon className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
