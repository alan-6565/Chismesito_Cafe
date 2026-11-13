import type { Metadata } from "next";
import Link from "next/link";
import GiveawayEntryForm from "@/components/GiveawayEntryForm";
import Reveal from "@/components/Reveal";
import SeasonalSky from "@/components/SeasonalSky";
import Countdown from "@/components/rewards/Countdown";
import PrizeTicket from "@/components/rewards/PrizeTicket";
import { GIVEAWAY_PRIZES, formatMonth, giveawayDates, giveawayMonth } from "@/lib/giveaway";
import { pacificToISO } from "@/lib/hours";

export const metadata: Metadata = {
  title: "Chismesito Rewards · Monthly Giveaway",
  description: "Order online and you're automatically entered to win 2 free drinks every month.",
};

export const dynamic = "force-dynamic";

const line = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

/** Rewards = the monthly giveaway: a prize ticket, a live countdown, how it works, and the free entry form. */
export default function RewardsPage() {
  const month = giveawayMonth();
  const { endsOn, drawnOn } = giveawayDates(month);
  const [y, m] = month.split("-").map(Number);
  // Entries close at midnight Pacific when the next month starts
  const next = `${m === 12 ? y + 1 : y}-${String(m === 12 ? 1 : m + 1).padStart(2, "0")}-01`;
  const endsAt = pacificToISO(next, "00:00");
  const prize = GIVEAWAY_PRIZES[0];
  const monthName = formatMonth(month);

  const steps = [
    {
      title: "Order online",
      text: "Every online order adds an entry, automatically.",
      icon: (
        <svg viewBox="0 0 32 32" className="w-9 h-9" {...line}>
          <path d="M3 5h3l3 15h15l3-10H8M12 26a1.5 1.5 0 1 0 0-.1M22 26a1.5 1.5 0 1 0 0-.1" />
        </svg>
      ),
    },
    {
      title: "Or enter free",
      text: "No purchase needed — one free entry each month.",
      icon: (
        <svg viewBox="0 0 32 32" className="w-9 h-9" {...line}>
          <path d="M8 6h16l-2 22H10L8 6ZM7 3h18v3H7z" />
          <path d="M16 13.5c-1.5-2-4.5-.7-3 1.5l3 3 3-3c1.5-2.2-1.5-3.5-3-1.5Z" />
        </svg>
      ),
    },
    {
      title: `Win ${prize.title.toLowerCase()}`,
      text: `One winner picked ${drawnOn} — we'll email you.`,
      icon: (
        <svg viewBox="0 0 32 32" className="w-9 h-9" {...line}>
          <path d="M5 12h22v5H5zM7 17h18v11H7zM16 12v16M16 12c-2-5-8-5-7-1 .5 1.5 4 1 7 1Zm0 0c2-5 8-5 7-1-.5 1.5-4 1-7 1Z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="overflow-x-clip pb-10">
      {/* Hero: prize ticket + countdown */}
      <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_70%_40%,#a3203f_0%,#7e1533_50%,#4f0b1f_100%)] text-white">
        <SeasonalSky density={0.8} />
        <div aria-hidden className="absolute inset-0 opacity-[0.06] bg-[repeating-linear-gradient(90deg,#fff_0_26px,transparent_26px_52px)]" />
        <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8 py-14 sm:py-20 grid md:grid-cols-[1.05fr_1fr] gap-12 items-center">
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#ffd9e3]">{monthName} giveaway</p>
            <h1 className="mt-2 font-script text-6xl sm:text-7xl leading-[0.95]">
              Chismesito
              <br />
              <span className="pl-8 sm:pl-12">Rewards ♡</span>
            </h1>
            <p className="mt-5 font-semibold text-white/90 sm:text-lg max-w-md">
              Order online and you&apos;re automatically entered to win {prize.title.toLowerCase()} — a new winner every month!
            </p>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-white/70">Entries close in</p>
            <div className="mt-2">
              <Countdown endsAt={endsAt} />
            </div>
            <p className="mt-3 text-sm text-white/70">Enter by {endsOn} · winner drawn {drawnOn}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/menu" className="rounded-full bg-white text-wine-dark font-semibold px-7 py-3 shadow-lg hover:bg-cream transition-colors">
                Order &amp; get entered →
              </Link>
              <a href="#enter" className="rounded-full border-2 border-white/80 text-white font-semibold px-7 py-3 hover:bg-white hover:text-wine-dark transition-colors">
                Enter free
              </a>
            </div>
          </Reveal>
          <Reveal delay={200} className="justify-self-center md:justify-self-end w-full flex justify-center md:justify-end">
            <div className="bob" style={{ ["--r" as string]: "0deg" }}>
              <PrizeTicket prize={prize.title} detail={prize.detail} month={monthName} drawnOn={drawnOn} />
            </div>
          </Reveal>
        </div>
        {/* scalloped bottom edge */}
        <div aria-hidden className="relative h-6 bg-cream [mask:radial-gradient(circle_at_14px_0,transparent_13px,#000_13.5px)_0_0/28px_100%_repeat-x]" />
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 sm:px-8 pt-14">
        <Reveal className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-berry">How it works</p>
          <h2 className="mt-1 font-display font-bold text-3xl sm:text-4xl text-wine-dark">Your shot at free drinks</h2>
        </Reveal>
        <div className="relative mt-10 grid sm:grid-cols-3 gap-8 sm:gap-6">
          <div aria-hidden className="hidden sm:block absolute top-10 left-[16%] right-[16%] border-t-[3px] border-dashed border-blush" />
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 140} className="relative text-center">
              <div className="relative mx-auto w-20 h-20 rounded-full bg-[#fffaf6] border-2 border-blush shadow-[0_10px_24px_-10px_rgba(126,21,51,.4)] grid place-items-center text-berry transition-transform duration-500 hover:rotate-[-8deg] hover:scale-110">
                {s.icon}
                <span className="absolute -top-1 -right-1 grid place-items-center w-7 h-7 rounded-full bg-wine text-white text-xs font-bold">{i + 1}</span>
              </div>
              <p className="mt-4 font-bold text-lg text-ink">{s.title}</p>
              <p className="mt-1 text-sm text-ink/65 max-w-56 mx-auto">{s.text}</p>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-10 text-center">
          <Link href="/menu" className="inline-block rounded-full bg-berry hover:bg-berry-dark text-white font-semibold px-8 py-3.5 shadow-lg shadow-berry/25 transition-colors">
            Order now &amp; get entered ›
          </Link>
        </Reveal>
      </section>

      {/* Free entry, styled as a ticket stub */}
      <section id="enter" className="mx-auto max-w-5xl px-4 sm:px-8 pt-16 scroll-mt-28">
        <Reveal>
          <div className="relative grid md:grid-cols-[0.9fr_1.3fr] rounded-[2rem] bg-[#fffaf6] border border-blush shadow-[0_24px_50px_-22px_rgba(74,15,34,.4)] overflow-hidden">
            <div className="relative bg-gradient-to-br from-blush-soft to-blush p-7 sm:p-9 flex flex-col justify-center">
              <p className="font-script text-3xl text-berry">No purchase needed</p>
              <h2 className="mt-1 font-display font-bold text-3xl text-wine-dark">Enter for free</h2>
              <p className="mt-3 text-ink/70">One free entry per person each month — and every online order adds another. More orders, more chances ♡</p>
              <Link href="/giveaway/rules" className="mt-4 text-sm font-semibold text-wine underline underline-offset-4 hover:text-berry">
                Official rules
              </Link>
              {/* perforation between stub and form */}
              <div aria-hidden className="hidden md:block absolute right-0 top-6 bottom-6 border-r-[3px] border-dotted border-wine/25" />
            </div>
            <div className="p-7 sm:p-9">
              <GiveawayEntryForm />
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
