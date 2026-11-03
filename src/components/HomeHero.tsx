"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";

// Homepage banner from the mockup: the monthly giveaway first, then the
// cafe's own photo banners, rotating with dots underneath.

function Leaf({ className, color }: { className: string; color: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <path
        fill={color}
        d="M32 2 37 16l11-7-3 14 15-2-10 11 12 6-15 4 6 13-13-6-2 15-6-11-6 11-2-15-13 6 6-13-15-4 12-6L4 21l15 2-3-14 11 7Z"
      />
      <path d="M32 18v44" stroke="#7a2a12" strokeWidth="1.6" opacity=".45" />
    </svg>
  );
}

function Cups() {
  return (
    <svg viewBox="0 0 64 48" className="w-16 h-12 sm:w-20 sm:h-14" fill="none" stroke="#4a0f22" strokeWidth="2.4" strokeLinejoin="round" aria-hidden>
      <path d="M6 14h22l-3 30H9L6 14ZM4 9h26v5H4zM17 9l4-7h6" />
      <path d="M36 14h22l-3 30H39l-3-30ZM34 9h26v5H34zM47 9l4-7h6" />
      <path d="M17 24c-2-3-6-1-4 2l4 4 4-4c2-3-2-5-4-2Z" fill="#e04674" stroke="none" />
      <path d="M47 24c-2-3-6-1-4 2l4 4 4-4c2-3-2-5-4-2Z" fill="#e04674" stroke="none" />
    </svg>
  );
}

function GiveawaySlide({ month }: { month: string }) {
  return (
    <div className="relative h-full overflow-hidden bg-[radial-gradient(ellipse_at_70%_45%,#a3203f_0%,#7e1533_45%,#4f0b1f_100%)]">
      {/* Fall leaves and flowers around the edges */}
      <Leaf className="absolute -left-6 -top-4 w-28 rotate-[-25deg]" color="#e8a23a" />
      <Leaf className="absolute left-10 -top-8 w-20 rotate-12" color="#c4451f" />
      <Leaf className="absolute -right-6 top-6 w-24 rotate-45" color="#e8a23a" />
      <Leaf className="absolute right-[38%] -bottom-8 w-20 -rotate-12 hidden md:block" color="#c4451f" />
      <Leaf className="absolute -right-4 bottom-10 w-28 rotate-[20deg]" color="#d9661f" />
      <div className="absolute -left-10 bottom-0 w-44 sm:w-56 aspect-[340/320]">
        <Image src="/images/florals-clear.png" alt="" fill sizes="224px" className="object-contain" />
      </div>

      <div className="relative mx-auto max-w-7xl h-full px-5 sm:px-10 pb-12 flex flex-col">
      <div className="flex-1 min-h-0 grid md:grid-cols-[1.1fr_1fr] items-center gap-4">
        <div className="relative z-10 pt-8 md:pt-0 text-center md:text-left">
          <span className="inline-block -rotate-3 rounded-2xl bg-[#fdf0d8] px-5 py-1.5 font-bubble text-3xl sm:text-4xl text-wine-dark shadow-lg">
            {month}
          </span>
          <h1 className="mt-2 font-bubble leading-[0.9] text-[3.4rem] sm:text-7xl lg:text-[5.5rem] -rotate-3 [filter:drop-shadow(0_5px_0_#4a0f22)_drop-shadow(0_10px_16px_rgba(0,0,0,.35))]">
            <span className="block bg-gradient-to-b from-[#ffe9a8] to-[#f6b52e] bg-clip-text text-transparent [-webkit-text-stroke:2px_#5c0f25]">
              Monthly
            </span>
            <span className="block bg-gradient-to-b from-[#ffe08a] to-[#f2a516] bg-clip-text text-transparent [-webkit-text-stroke:2px_#5c0f25]">
              Giveaway!
            </span>
          </h1>
          <span className="mt-3 inline-block -rotate-3 rounded-lg bg-wine-dark/90 border-2 border-[#f2c86b]/70 px-5 py-1 font-script text-2xl sm:text-3xl text-[#fdf0d8] shadow-lg">
            Be This Month&apos;s Winner! ♡
          </span>
          <div className="mt-4 flex justify-center md:justify-start">
            <span className="inline-flex items-center gap-3 rounded-[2rem] bg-[#fff8ee] px-5 py-2 shadow-xl -rotate-2">
              <Cups />
              <span className="font-bubble text-2xl sm:text-3xl leading-[0.95] text-wine-dark text-left">
                WIN
                <br />2 FREE
                <br />DRINKS!
              </span>
            </span>
          </div>
        </div>

        <div className="relative h-56 sm:h-72 md:h-full md:max-h-[430px] -mt-2 md:mt-0">
          <Image
            src="/images/hero-cups.webp"
            alt="Two Chismesito Cafe iced drinks"
            fill
            priority
            sizes="(min-width: 768px) 45vw, 90vw"
            className="object-contain [mask-image:radial-gradient(ellipse_at_center,black_52%,transparent_72%)]"
          />
        </div>
      </div>
      <div className="relative z-10">
        <div className="mx-auto max-w-2xl rounded-full bg-[#fff8ee]/95 shadow-xl grid grid-cols-2 divide-x divide-wine/20 text-left">
          <div className="flex items-center gap-3 px-4 sm:px-6 py-3">
            <svg viewBox="0 0 24 24" className="w-9 h-9 shrink-0 text-ink" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden>
              <rect x="4" y="5" width="16" height="11" rx="1.5" />
              <path d="M2 19h20" />
            </svg>
            <span className="text-xs sm:text-sm font-semibold text-ink leading-tight">
              Order online at
              <br />
              chismesitocafe.com
            </span>
          </div>
          <div className="flex items-center gap-3 px-4 sm:px-6 py-3">
            <svg viewBox="0 0 24 24" className="w-9 h-9 shrink-0 text-ink" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
              <circle cx="12" cy="12" r="9" />
              <path d="m8 12.5 2.7 2.7L16.5 9.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-xs sm:text-sm font-semibold text-ink leading-tight">
              Get automatically
              <br />
              entered to win!
            </span>
          </div>
        </div>
        <div className="mt-4 flex justify-center">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 rounded-full bg-wine border-2 border-[#ff9fb8]/70 px-8 py-3 text-lg font-semibold text-white shadow-[0_0_24px_rgba(255,120,160,0.45)] hover:bg-wine-dark transition-colors"
          >
            Order Now <ArrowRightIcon />
          </Link>
        </div>
      </div>
      </div>
    </div>
  );
}

function PhotoSlide({ src, alt, href }: { src: string; alt: string; href: string }) {
  return (
    <Link href={href} className="relative block h-full bg-cream">
      <Image src={src} alt={alt} fill sizes="100vw" className="object-cover" />
    </Link>
  );
}

export default function HomeHero({ month }: { month: string }) {
  const slides = [
    <GiveawaySlide key="giveaway" month={month} />,
    <PhotoSlide key="hero" src="/images/hero.png" alt="Coffee with a little chisme. Specialty drinks, good vibes, and a place to spill the tea." href="/menu" />,
    <PhotoSlide key="fall" src="/images/fall-menu-banner.png" alt="Chismesito Cafe Fall Menu" href="/menu" />,
  ];
  const [index, setIndex] = useState(0);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (hover) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 7000);
    return () => clearInterval(t);
  }, [hover, slides.length]);

  return (
    <section className="relative" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div className="relative h-[760px] sm:h-[720px] md:h-[600px] lg:h-[640px]">
        {slides.map((s, i) => (
          <div key={i} aria-hidden={i !== index} className={`absolute inset-0 transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            {s}
          </div>
        ))}
      </div>

      <div className="absolute bottom-4 inset-x-0 flex justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Show banner ${i + 1}`}
            className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-2 bg-white/60"} ${index !== 0 ? "ring-1 ring-ink/20" : ""}`}
          />
        ))}
      </div>
    </section>
  );
}
