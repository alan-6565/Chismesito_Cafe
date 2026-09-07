import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import PromoCarousel from "@/components/PromoCarousel";
import { CupIcon, LeafIcon, HeartIcon, PinIcon } from "@/components/icons";
import { promotion, promoSlides, business } from "@/lib/data";
import { getMenu } from "@/lib/menu";

export const revalidate = 0;

const features = [
  { Icon: CupIcon, title: "Specialty Drinks", text: "Unique flavors you won't find anywhere else." },
  { Icon: LeafIcon, title: "Quality Ingredients", text: "Made with premium and fresh ingredients." },
  { Icon: HeartIcon, title: "Made with Love", text: "Every drink is made to make you smile." },
  { Icon: PinIcon, title: "Richmond, CA", text: "Proudly serving our amazing community." },
];

export default async function Home() {
  const items = await getMenu();
  const trending = items.filter((i) => i.featured).slice(0, 5);

  return (
    <div>
      {/* Hero */}
      <section className="relative w-full h-[420px] sm:h-[520px] lg:h-[640px]">
        <Image
          src="/images/hero.png"
          alt="Chismesito Cafe — coffee with a little chisme. Specialty drinks, good vibes, and a place to spill the tea."
          fill
          priority
          sizes="100vw"
          className="object-cover object-left sm:object-center"
        />
        <h1 className="sr-only">{business.tagline}</h1>
        <div className="absolute inset-0 flex items-end pb-10 sm:pb-14 lg:pb-16">
          <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-3">
              <Link
                href="/menu"
                className="rounded-full bg-rose hover:bg-rose-dark text-white font-semibold px-6 py-3 shadow-lg transition-colors"
              >
                View Menu
              </Link>
              <Link
                href="/order"
                className="rounded-full border-2 border-maroon bg-cream/90 text-maroon font-semibold px-6 py-3 shadow-lg hover:bg-maroon hover:text-cream transition-colors"
              >
                Order Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-center font-display font-bold text-2xl sm:text-3xl text-maroon">
          🌸 Trending Now 🌸
        </h2>
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
          {trending.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* Promo carousel */}
      <section id="seasonal" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <PromoCarousel slides={promoSlides} />
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-2 lg:grid-cols-4 gap-y-8 lg:gap-y-0 lg:divide-x divide-blush text-center">
        {features.map((f) => (
          <div key={f.title} className="flex flex-col items-center gap-2 px-4">
            <f.Icon className="w-7 h-7 text-rose" />
            <h4 className="font-display font-semibold text-maroon text-sm uppercase tracking-wide">
              {f.title}
            </h4>
            <p className="text-xs text-ink/60">{f.text}</p>
          </div>
        ))}
      </section>

      {/* Promotion */}
      {promotion.active && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="rounded-3xl bg-maroon text-cream px-6 sm:px-10 py-8 text-center">
            <h3 className="font-display font-bold text-2xl">{promotion.title}</h3>
            <p className="text-cream/70 mt-1 max-w-xl mx-auto">{promotion.description}</p>
            <button className="mt-4 rounded-full bg-rose hover:bg-rose-dark text-white font-semibold px-5 py-2.5 text-sm transition-colors">
              {promotion.cta}
            </button>
          </div>
        </section>
      )}

      {/* Visit us strip */}
      <section id="visit" className="pb-12">
        <div className="relative w-full aspect-[2234/788] overflow-hidden">
          <Image
            src="/images/visit-banner.png"
            alt={`Visit Chismesito Cafe — ${business.address}. ${business.hours}`}
            fill
            sizes="100vw"
            className="object-cover"
          />

          {/* Real CTA buttons, overlaid in the blank space below the baked-in hours text */}
          <div
            className="absolute flex flex-wrap gap-2 sm:gap-3"
            style={{ left: "53%", top: "64%" }}
          >
            <Link
              href="/contact"
              className="rounded-full bg-rose hover:bg-rose-dark text-white text-[10px] sm:text-sm font-semibold px-2.5 sm:px-5 py-1.5 sm:py-2.5 shadow transition-colors"
            >
              Get Directions
            </Link>
            <Link
              href="/gallery"
              className="rounded-full border-2 border-maroon bg-cream/80 text-maroon text-[10px] sm:text-sm font-semibold px-2.5 sm:px-5 py-1.5 sm:py-2.5 shadow hover:bg-maroon hover:text-cream transition-colors"
            >
              Follow Us
            </Link>
          </div>

          {/* Invisible hotspots aligned exactly over the baked-in social icons — visible tint on hover so the hit target is discoverable */}
          <a
            href={`https://instagram.com/${business.instagram.replace("@", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="absolute rounded-full hover:bg-white/25 transition-colors"
            style={{ left: "62%", top: "82%", width: "4.5%", height: "12%" }}
          />
          <a
            href={`https://tiktok.com/${business.tiktok.replace("@", "@")}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
            className="absolute rounded-full hover:bg-white/25 transition-colors"
            style={{ left: "66.9%", top: "82%", width: "4.5%", height: "12%" }}
          />
          <a
            href="https://facebook.com/chismesitocafe"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="absolute rounded-full hover:bg-white/25 transition-colors"
            style={{ left: "71.4%", top: "82%", width: "4.5%", height: "12%" }}
          />
        </div>
      </section>
    </div>
  );
}
