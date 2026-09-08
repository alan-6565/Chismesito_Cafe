import Image from "next/image";
import Link from "next/link";
import { business } from "@/lib/data";
import TodayScheduleLabel from "@/components/TodayScheduleLabel";
import { InstagramIcon, CupIcon, HeartIcon, PinIcon, LeafIcon, ClockIcon, PhoneIcon } from "@/components/icons";

const FEATURES = [
  { Icon: CupIcon, label: "Great Drinks" },
  { Icon: HeartIcon, label: "Friendly Vibes" },
  { Icon: PinIcon, label: "Local & Proud" },
  { Icon: LeafIcon, label: "Always Fresh" },
];

export default function ContactPage() {
  const mapsQuery = encodeURIComponent(business.address);
  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${mapsQuery}`;
  const telHref = `tel:+1${business.phone.replace(/\D/g, "")}`;

  return (
    <div>
      {/* Floral background already has "Visit Chismesito" baked in as the
          page's own hero text, so there's no separate visible heading here —
          just an sr-only one for accessibility/SEO. Scoped tightly to this
          block (not the whole page) and padded so the grid below clears the
          image's own text before it starts. */}
      <div className="bg-blush/40 bg-cover bg-top" style={{ backgroundImage: "url(/images/contact-background.png)" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-48 sm:pt-56 pb-12">
          <h1 className="sr-only">Visit Chismesito — Great coffee, good company, always.</h1>

          <div className="grid lg:grid-cols-[1fr_1fr_1fr] gap-6 items-start">
            {/* Info card */}
            <div className="rounded-3xl bg-cream/95 shadow-sm p-6 flex flex-col gap-5">
              <div className="flex gap-3">
                <PinIcon className="w-6 h-6 text-maroon shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-maroon">{business.streetAddress}</p>
                  <p className="text-ink/70 text-sm">
                    {business.city}, {business.state} {business.zip}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <ClockIcon className="w-6 h-6 text-maroon shrink-0 mt-0.5" />
                <div>
                  <TodayScheduleLabel />
                  <p className="text-ink/70 text-sm mt-0.5">{business.hours}</p>
                </div>
              </div>

              <a href={telHref} className="flex gap-3 hover:opacity-70 transition-opacity">
                <PhoneIcon className="w-6 h-6 text-maroon shrink-0" />
                <p className="font-semibold text-maroon">{business.phone}</p>
              </a>

              <a
                href={business.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-3 hover:opacity-70 transition-opacity"
              >
                <InstagramIcon className="w-6 h-6 text-maroon shrink-0" />
                <div>
                  <p className="font-semibold text-maroon">{business.instagram}</p>
                  <p className="text-ink/70 text-sm">Follow us on Instagram</p>
                </div>
              </a>

              <div className="flex flex-wrap gap-3 mt-1">
                <a
                  href={directionsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-rose hover:bg-rose-dark text-white font-semibold px-6 py-3 text-sm transition-colors"
                >
                  Get Directions
                </a>
                <a
                  href={telHref}
                  className="rounded-full border-2 border-maroon text-maroon font-semibold px-6 py-3 text-sm hover:bg-maroon hover:text-cream transition-colors"
                >
                  Call Us
                </a>
              </div>
            </div>

            {/* Storefront photo */}
            <div className="relative rounded-3xl overflow-hidden shadow-sm min-h-[280px] lg:h-full">
              <Image
                src="/images/contact-storefront.png"
                alt="Chismesito Cafe storefront in Richmond, CA"
                fill
                sizes="(min-width: 1024px) 33vw, 100vw"
                className="object-cover"
              />
            </div>

            {/* Live map */}
            <div className="relative rounded-3xl overflow-hidden shadow-sm min-h-[280px] lg:h-full">
              <iframe
                title="Map to Chismesito Cafe"
                src={`https://www.google.com/maps?q=${mapsQuery}&output=embed`}
                className="absolute inset-0 h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <a
                href={directionsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-3 left-3 rounded-full bg-white shadow px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blush transition-colors"
              >
                Open in Maps ↗
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Coming by CTA */}
        <div className="rounded-3xl bg-blush flex flex-col sm:flex-row items-center gap-4 justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-rose/15 flex items-center justify-center shrink-0">
              <CupIcon className="w-7 h-7 text-rose-dark" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-maroon">Coming by?</h3>
              <p className="text-sm text-ink/70">Order ahead and we&rsquo;ll have it ready.</p>
            </div>
          </div>
          <Link
            href="/menu"
            className="rounded-full bg-rose hover:bg-rose-dark text-white font-semibold px-6 py-3 text-sm transition-colors whitespace-nowrap"
          >
            Order for Pickup →
          </Link>
        </div>

        {/* Feature row */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-y-8 text-center">
          {FEATURES.map(({ Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <Icon className="w-7 h-7 text-rose" />
              <p className="font-display font-semibold text-maroon text-sm">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
