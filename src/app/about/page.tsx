import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import PapelPicado from "@/components/story/PapelPicado";
import StoryThread from "@/components/story/StoryThread";
import CountUp from "@/components/story/CountUp";
import { business } from "@/lib/data";
import { getMenu } from "@/lib/menu";

export const revalidate = 3600;

// Our Story, told as chapters you scroll through: a thread fills in down the
// page, polaroids drop in, and it ends on the cafe's thank-you note.
// All wording comes from the cafe's own story text (business.story).

type Chapter = {
  n: string;
  title: string;
  body: string;
  img: string;
  alt: string;
  caption: string;
  tilt: number;
  chips?: string[];
};

const SIGNATURES = ["Tres Leches Latte", "Mazapan Latte", "Strawberry Horchata", "Churro Latte", "Cookie Butter Matcha", "Ube Sago"];

const CHAPTERS: Chapter[] = [
  {
    n: "01",
    title: "A dream between friends",
    body: "Chismesito Cafe was created with one idea: bringing people together over great coffee, delicious drinks, and even better conversations.",
    img: "/images/community.png",
    alt: "Friends toasting Chismesito Cafe iced drinks",
    caption: "where it all started ♡",
    tilt: -3,
  },
  {
    n: "02",
    title: "A cozy corner of Richmond",
    body: "That dream turned into a little cafe on Barrett Ave — a cozy corner of Richmond where neighbors stop in for their daily cup.",
    img: "/images/storefront.png",
    alt: "Chismesito Cafe storefront on Barrett Ave in Richmond, CA",
    caption: `${business.streetAddress} ✿`,
    tilt: 3,
  },
  {
    n: "03",
    title: "Drinks worth talking about",
    body: "Handcrafted lattes, matchas, chais and sagos, with flavors like tres leches, mazapan and horchata — plus seasonal menus for fall and the holidays.",
    img: "/images/about-drinks.png",
    alt: "A lineup of handcrafted Chismesito Cafe iced drinks",
    caption: "the lineup ☕",
    tilt: -2,
    chips: SIGNATURES,
  },
  {
    n: "04",
    title: "…and stay for the chisme",
    body: "Come for the coffee, stay for the conversation. Pull up a chair, the tea is always hot.",
    img: "/images/about-street.png",
    alt: "Chismesito Cafe signage in Richmond, CA",
    caption: "see you soon!",
    tilt: 2.5,
  },
];

function Polaroid({ c, priority = false }: { c: Chapter; priority?: boolean }) {
  return (
    <div className="relative mx-auto w-full max-w-sm transition-transform duration-500 hover:rotate-0 hover:scale-[1.02]" style={{ rotate: `${c.tilt}deg` }}>
      <span aria-hidden className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 w-28 h-8 rotate-[-4deg] rounded-sm bg-berry/35 backdrop-blur-[1px]" />
      <div className="bg-white p-3 pb-12 shadow-[0_22px_44px_-12px_rgba(74,15,34,0.35)]">
        <div className="relative aspect-[4/3.3] overflow-hidden bg-blush-soft">
          <Image src={c.img} alt={c.alt} fill priority={priority} sizes="(min-width: 768px) 384px, 90vw" className="object-cover" />
        </div>
        <p className="absolute bottom-3 inset-x-0 text-center font-script text-2xl text-wine">{c.caption}</p>
      </div>
    </div>
  );
}

export default async function AboutPage() {
  let menuCount = 0;
  try {
    menuCount = (await getMenu()).filter((i) => i.available).length;
  } catch {
    // menu unavailable — the stat just hides
  }
  const menuStat = menuCount >= 20 ? Math.floor(menuCount / 10) * 10 : 0;

  return (
    <div className="overflow-x-clip">
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-blush-soft via-cream to-cream pb-16">
        <PapelPicado />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-8 pt-12 sm:pt-16 text-center">
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-berry">Since 2023</p>
            <h1 className="mt-2 font-script font-bold text-7xl sm:text-8xl lg:text-9xl text-wine-dark leading-[0.9]">Our Story</h1>
            <p className="mt-5 font-display text-xl sm:text-2xl text-wine">
              {business.tagline} <span className="text-berry">♡</span>
            </p>
          </Reveal>
          <div className="mt-10 flex flex-col items-center gap-1 text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">
            Scroll to read
            <span className="bob text-xl text-berry" aria-hidden>
              ↓
            </span>
          </div>
        </div>
      </section>

      {/* Chapters along the thread */}
      <section className="mx-auto max-w-6xl px-4 sm:px-8 pb-10">
        <StoryThread>
          <div className="space-y-24 sm:space-y-32 py-6">
            {CHAPTERS.map((c, i) => {
              const flip = i % 2 === 1;
              return (
                <article key={c.n} className="relative grid md:grid-cols-2 gap-10 md:gap-20 items-center pl-14 md:pl-0">
                  {/* Text */}
                  <Reveal className={flip ? "md:order-2" : ""}>
                    <span className="font-display font-black text-6xl sm:text-7xl text-blush leading-none select-none">{c.n}</span>
                    <h2 className="-mt-6 sm:-mt-8 relative font-display font-bold text-3xl sm:text-4xl text-wine-dark">{c.title}</h2>
                    <p className="mt-4 text-ink/75 text-base sm:text-lg leading-relaxed max-w-md">{c.body}</p>
                    {c.chips && (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {c.chips.map((chip, j) => (
                          <Reveal key={chip} pop rotate={j % 2 ? 2 : -2} delay={150 + j * 90}>
                            <Link
                              href="/menu"
                              className="inline-block rounded-full bg-white border border-blush px-3.5 py-1.5 text-sm font-semibold text-wine hover:bg-berry hover:text-white hover:border-berry transition-colors shadow-sm"
                            >
                              {chip}
                            </Link>
                          </Reveal>
                        ))}
                      </div>
                    )}
                  </Reveal>
                  {/* Photo */}
                  <Reveal delay={150} className={flip ? "md:order-1" : ""}>
                    <Polaroid c={c} priority={i === 0} />
                  </Reveal>
                </article>
              );
            })}
          </div>
        </StoryThread>
      </section>

      {/* By the numbers */}
      <section className="relative py-14 text-[#fff4ea] bg-wine overflow-hidden">
        <div aria-hidden className="absolute inset-0 opacity-[0.07] bg-[repeating-linear-gradient(90deg,#fff_0_26px,transparent_26px_52px)]" />
        <div className="relative mx-auto max-w-5xl px-4 grid grid-cols-3 gap-4 text-center">
          <Reveal>
            <p className="font-display font-black text-4xl sm:text-6xl">
              <CountUp to={2023} format={false} />
            </p>
            <p className="mt-1 text-sm sm:text-base text-[#ffd9e3]">Opened our doors</p>
          </Reveal>
          <Reveal delay={120}>
            <p className="font-display font-black text-4xl sm:text-6xl">
              <CountUp to={3000} suffix="+" />
            </p>
            <p className="mt-1 text-sm sm:text-base text-[#ffd9e3]">Instagram familia</p>
          </Reveal>
          {menuStat > 0 && (
            <Reveal delay={240}>
              <p className="font-display font-black text-4xl sm:text-6xl">
                <CountUp to={menuStat} suffix="+" />
              </p>
              <p className="mt-1 text-sm sm:text-base text-[#ffd9e3]">Things on the menu</p>
            </Reveal>
          )}
        </div>
      </section>

      {/* Thank-you note */}
      <section className="mx-auto max-w-3xl px-4 sm:px-8 py-20">
        <Reveal>
          <div className="relative -rotate-1 rounded-sm bg-[#fffdf8] px-7 sm:px-12 py-10 shadow-[0_24px_50px_-18px_rgba(74,15,34,.35)] bg-[repeating-linear-gradient(to_bottom,transparent_0_35px,rgba(126,21,51,.09)_35px_36px)]">
            <span aria-hidden className="absolute -top-4 left-10 w-24 h-8 rotate-[-6deg] rounded-sm bg-[#f2b33d]/50" />
            <span aria-hidden className="absolute -top-4 right-10 w-24 h-8 rotate-[5deg] rounded-sm bg-berry/30" />
            <span aria-hidden className="absolute top-0 bottom-0 left-5 sm:left-8 w-px bg-berry/30" />
            <p className="font-script text-3xl sm:text-4xl text-wine-dark leading-[1.45]">
              Thank you for supporting our small business. We can&apos;t wait to serve you ♡
            </p>
            <p className="mt-6 text-right font-script text-2xl text-berry">— Chismesito Cafe</p>
            <div className="relative mt-6 h-20 w-20 ml-auto -rotate-12 opacity-90">
              <Image src="/images/logo-clear.png" alt="" fill sizes="80px" className="object-contain" />
            </div>
          </div>
        </Reveal>
        <Reveal delay={150} className="mt-12 flex flex-wrap justify-center gap-3">
          <Link href="/menu" className="rounded-full bg-wine px-7 py-3 font-semibold text-white shadow-lg shadow-wine/25 hover:bg-wine-dark transition-colors">
            See the menu →
          </Link>
          <Link href="/contact" className="rounded-full border-2 border-wine px-7 py-3 font-semibold text-wine hover:bg-wine hover:text-white transition-colors">
            Come visit us
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
