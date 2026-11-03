import Image from "next/image";
import { business } from "@/lib/data";

const line = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const stats = [
  {
    value: "2023",
    label: "Founded",
    icon: (
      <svg viewBox="0 0 32 32" className="w-10 h-10" {...line}>
        <path d="M5 11h18v7a7 7 0 0 1-7 7h-4a7 7 0 0 1-7-7v-7ZM23 13h2a3 3 0 0 1 0 6h-2M4 28h22" />
        <path d="M13 15.5c-1.3-1.8-4-.6-2.7 1.3L13 19.5l2.7-2.7c1.3-1.9-1.4-3.1-2.7-1.3Z" />
      </svg>
    ),
  },
  {
    value: "3,000+",
    label: "Instagram Family",
    icon: (
      <svg viewBox="0 0 32 32" className="w-10 h-10" {...line}>
        <circle cx="16" cy="10" r="4" />
        <circle cx="7.5" cy="13" r="3" />
        <circle cx="24.5" cy="13" r="3" />
        <path d="M9 26c0-4 3-7 7-7s7 3 7 7M2.5 25c0-3 2-5.5 5-5.5 1.3 0 2.4.4 3.3 1M29.5 25c0-3-2-5.5-5-5.5-1.3 0-2.4.4-3.3 1" />
      </svg>
    ),
  },
  {
    value: "30+",
    label: "Menu Items",
    icon: (
      <svg viewBox="0 0 32 32" className="w-10 h-10" {...line}>
        <path d="M8 6h16l-2 22H10L8 6ZM7 3h18v3H7z" />
        <path d="M16 13.5c-1.5-2-4.5-.7-3 1.5l3 3 3-3c1.5-2.2-1.5-3.5-3-1.5Z" />
      </svg>
    ),
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-8 py-12">
      <div className="grid md:grid-cols-[1.15fr_1fr] gap-10 items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-wine">Our Story</p>
          <h1 className="mt-1 font-display font-bold text-4xl sm:text-5xl text-wine-dark">
            The Chismesito <span className="whitespace-nowrap">Story <span className="text-berry">♡</span></span>
          </h1>
          <p className="mt-5 text-ink/80 leading-relaxed text-[15px] sm:text-base">
            {business.story.replace(" Thank you for supporting our small business. We can't wait to serve you.", "")}
          </p>
          <p className="mt-3 text-ink/80 leading-relaxed">Thank you for supporting our small business. We can&apos;t wait to serve you.</p>
        </div>

        {/* Polaroid with tape, like the mockup */}
        <div className="relative justify-self-center w-full max-w-sm rotate-3">
          <span aria-hidden className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 w-28 h-8 rotate-[-4deg] rounded-sm bg-berry/40 backdrop-blur-[1px]" />
          <div className="bg-white p-3 pb-10 shadow-[0_18px_40px_rgba(74,15,34,0.2)]">
            <div className="relative aspect-[4/3.2] overflow-hidden">
              <Image src="/images/storefront.png" alt="Chismesito Cafe storefront on Barrett Ave in Richmond, CA" fill sizes="384px" className="object-cover object-[35%_center]" />
            </div>
            <p className="mt-3 text-center font-script text-2xl text-wine">Richmond, CA ♡</p>
          </div>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-3 gap-4 text-center">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col items-center gap-1 text-wine">
            {s.icon}
            <p className="mt-1 font-display font-bold text-3xl sm:text-4xl text-ink">{s.value}</p>
            <p className="text-sm text-ink/70">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 relative aspect-[1000/440] rounded-[2rem] overflow-hidden shadow-[0_12px_36px_rgba(126,21,51,0.12)]">
        <Image src="/images/about-drinks.png" alt="A lineup of handcrafted Chismesito Cafe iced drinks" fill sizes="(min-width: 1152px) 1152px, 100vw" className="object-cover" />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden">
          <Image src="/images/community.png" alt="Friends toasting Chismesito Cafe iced drinks" fill sizes="50vw" className="object-cover" />
        </div>
        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden">
          <Image src="/images/about-street.png" alt="Chismesito Cafe signage in Richmond, CA" fill sizes="50vw" className="object-cover" />
        </div>
      </div>
    </div>
  );
}
