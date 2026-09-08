import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import PromoCarousel from "@/components/PromoCarousel";
import { CupIcon, LeafIcon, HeartIcon, PinIcon, InstagramIcon } from "@/components/icons";
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
