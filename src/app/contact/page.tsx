import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import SeasonalSky from "@/components/SeasonalSky";
import HoursBoard from "@/components/home/HoursBoard";
import CopyButton from "@/components/visit/CopyButton";
import OpenPill from "@/components/visit/OpenPill";
import { business } from "@/lib/data";
import { InstagramIcon, PinIcon, ClockIcon, PhoneIcon } from "@/components/icons";

// Visit Us: you "arrive" under the cafe's awning, then plan the trip with
// ticket-style cards, the hours sign, an order-ahead nudge, and the map as a
// postcard from Richmond.

function Ticket({ icon, title, children, delay = 0 }: { icon: React.ReactNode; title: string; children: React.ReactNode; delay?: number }) {
  return (
    <Reveal delay={delay}>
      <div className="relative h-full rounded-3xl bg-[#fffaf6] border border-blush shadow-[0_14px_30px_-16px_rgba(126,21,51,.35)] p-6 pt-7 transition-transform duration-300 hover:-translate-y-1">
        {/* ticket notches */}
        <span aria-hidden className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-cream border-r border-blush" />
        <span aria-hidden className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-cream border-l border-blush" />
        <div className="flex items-center gap-3">
          <span className="grid place-items-center w-11 h-11 rounded-full bg-blush-soft text-wine">{icon}</span>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-berry">{title}</p>
        </div>
        <div className="mt-4 border-t-2 border-dashed border-blush pt-4">{children}</div>
      </div>
    </Reveal>
  );
}

export default function ContactPage() {
  const mapsQuery = encodeURIComponent(business.address);
  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${mapsQuery}`;
  const telHref = `tel:+1${business.phone.replace(/\D/g, "")}`;

  return (
    <div className="overflow-x-clip">
      {/* Arrive at the storefront */}
      <section className="relative">
        <div className="relative h-[72vh] min-h-[460px] max-h-[720px] overflow-hidden">
          <Image
            src="/images/storefront.png"
            alt="Chismesito Cafe storefront on Barrett Ave in Richmond, CA"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[40%_35%] scale-105 animate-[kenburns_18s_ease-in-out_infinite_alternate]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-wine-dark/90 via-wine-dark/35 to-wine-dark/10" />
          <SeasonalSky density={0.6} />
          {/* awning edge hanging over the photo */}
          <div aria-hidden className="absolute inset-x-0 top-0 z-10">
            <div className="awning h-7" />
            <div className="awning-scallop" />
          </div>

          <div className="absolute inset-x-0 bottom-0 z-10">
            <div className="mx-auto max-w-6xl px-4 sm:px-8 pb-10 sm:pb-14 text-white">
              <Reveal>
                <OpenPill />
                <p className="mt-4 font-script text-4xl sm:text-5xl text-[#ffe3b8]">Ven a visitarnos</p>
                <h1 className="font-display font-bold text-5xl sm:text-7xl leading-[0.95]">Visit Chismesito</h1>
                <p className="mt-3 text-white/85 sm:text-lg max-w-xl">Come by for your favorite drinks, fresh pastries, and a whole lot of chisme.</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href={directionsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-white text-wine-dark font-semibold px-6 py-3 shadow-lg hover:bg-cream transition-colors"
                  >
                    Get Directions →
                  </a>
                  <a href={telHref} className="rounded-full border-2 border-white/80 text-white font-semibold px-6 py-3 hover:bg-white hover:text-wine-dark transition-colors">
                    Call Us
                  </a>
                  <Link href="/menu" className="rounded-full bg-berry text-white font-semibold px-6 py-3 shadow-lg shadow-berry/30 hover:bg-berry-dark transition-colors">
                    Order Ahead
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Plan your visit */}
      <section className="mx-auto max-w-6xl px-4 sm:px-8 pt-14">
        <Reveal className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-berry">Plan your visit</p>
          <h2 className="mt-1 font-display font-bold text-3xl sm:text-4xl text-wine-dark">Everything you need</h2>
        </Reveal>
        <div className="mt-8 grid sm:grid-cols-3 gap-5">
          <Ticket icon={<PinIcon className="w-6 h-6" />} title="Find us">
            <p className="font-bold text-ink text-lg">{business.streetAddress}</p>
            <p className="text-ink/70">
              {business.city}, {business.state} {business.zip}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <CopyButton text={business.address} label="Copy address" />
              <a href={directionsHref} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-berry hover:text-berry-dark">
                Open in Maps ›
              </a>
            </div>
          </Ticket>
          <Ticket icon={<ClockIcon className="w-6 h-6" />} title="Hours" delay={100}>
            {business.hours.split(" · ").map((h) => (
              <p key={h} className="font-semibold text-ink">
                {h}
              </p>
            ))}
            <p className="mt-2 text-sm text-ink/60">Open every day of the week ♡</p>
          </Ticket>
          <Ticket icon={<PhoneIcon className="w-6 h-6" />} title="Say hola" delay={200}>
            <a href={telHref} className="block font-bold text-ink text-lg hover:text-berry transition-colors">
              {business.phone}
            </a>
            <a
              href={business.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-2 text-ink/70 hover:text-berry transition-colors"
            >
              <InstagramIcon className="w-4 h-4" />
              {business.instagram}
            </a>
          </Ticket>
        </div>
      </section>

      {/* Hours sign + order ahead */}
      <section className="mx-auto max-w-6xl px-4 sm:px-8 pt-14 grid lg:grid-cols-2 gap-8 items-stretch">
        <Reveal>
          <HoursBoard />
        </Reveal>
        <Reveal delay={150}>
          <div className="relative h-full overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-wine via-wine to-berry text-white p-8 sm:p-10 flex flex-col justify-center shadow-[0_20px_40px_-18px_rgba(70,10,20,.5)]">
            <div aria-hidden className="absolute -right-10 -bottom-10 w-56 h-56 opacity-20 rotate-12">
              <Image src="/images/logo-clear.png" alt="" fill sizes="224px" className="object-contain" />
            </div>
            <p className="font-script text-3xl text-[#ffe3b8]">Skip the line</p>
            <h3 className="mt-1 font-display font-bold text-3xl sm:text-4xl leading-tight">Order ahead, grab it &amp; go</h3>
            <ul className="mt-5 space-y-2.5 text-white/90">
              <li className="flex gap-3">
                <span className="grid place-items-center w-6 h-6 shrink-0 rounded-full bg-white/20 text-sm font-bold">1</span>Build your drink online
              </li>
              <li className="flex gap-3">
                <span className="grid place-items-center w-6 h-6 shrink-0 rounded-full bg-white/20 text-sm font-bold">2</span>Pick a pickup time — today or tomorrow
              </li>
              <li className="flex gap-3">
                <span className="grid place-items-center w-6 h-6 shrink-0 rounded-full bg-white/20 text-sm font-bold">3</span>Walk in, it&apos;s ready ♡
              </li>
            </ul>
            <Link
              href="/menu"
              className="relative mt-7 self-start rounded-full bg-white text-wine-dark font-semibold px-7 py-3 shadow-lg hover:bg-cream transition-colors"
            >
              Start an order →
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Map as a postcard */}
      <section className="mx-auto max-w-6xl px-4 sm:px-8 py-16">
        <Reveal>
          <div className="relative rotate-[-0.6deg] rounded-[1.5rem] bg-[#fffdf8] p-3 sm:p-4 shadow-[0_26px_50px_-20px_rgba(74,15,34,.4)]">
            <div className="flex items-start justify-between gap-4 px-2 sm:px-3 pt-1 pb-3">
              <div>
                <p className="font-script text-3xl sm:text-4xl text-wine-dark leading-none">Greetings from Richmond!</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">
                  {business.city}, {business.state} {business.zip}
                </p>
              </div>
              {/* stamp + postmark */}
              <div className="relative shrink-0">
                <div className="relative w-16 h-20 sm:w-20 sm:h-24 rotate-3 bg-white p-1.5 shadow-md outline-[3px] outline-dashed outline-white outline-offset-[-1px] ring-1 ring-blush">
                  <div className="relative w-full h-full bg-blush-soft">
                    <Image src="/images/logo-clear.png" alt="" fill sizes="80px" className="object-contain p-1" />
                  </div>
                </div>
                <div
                  aria-hidden
                  className="absolute -left-12 top-8 w-20 h-20 bg-[#fffdf8]/40 rounded-full border-2 border-wine/35 grid place-items-center -rotate-12 text-[9px] font-bold uppercase tracking-widest text-wine/50 text-center leading-tight"
                >
                  Barrett
                  <br />
                  Ave ♡
                </div>
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-blush">
              <iframe
                title="Map to Chismesito Cafe"
                src={`https://www.google.com/maps?q=${mapsQuery}&z=16&output=embed`}
                className="w-full h-80 sm:h-[26rem] border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
