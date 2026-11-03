import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import GiveawayEntryForm from "@/components/GiveawayEntryForm";
import { GIVEAWAY_PRIZES, formatMonth, giveawayDates, giveawayDay, giveawayMonth } from "@/lib/giveaway";

export const metadata: Metadata = {
  title: "Chismesito Rewards · Monthly Giveaway",
  description: "Order online and you're automatically entered to win 2 free drinks every month.",
};

export const dynamic = "force-dynamic";

const line = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

function CupBadge({ filled }: { filled: boolean }) {
  return (
    <span className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center ${filled ? "border-berry bg-blush-soft text-berry" : "border-wine/40 text-wine/40"}`}>
      <svg viewBox="0 0 24 24" className="w-6 h-6" {...line}>
        <path d="M6 7h12l-1.3 13H7.3L6 7ZM5 4.5h14V7H5z" />
      </svg>
    </span>
  );
}

/** The mockup's Rewards screen, built around the monthly giveaway */
export default function RewardsPage() {
  const month = giveawayMonth();
  const { endsOn, drawnOn } = giveawayDates(month);
  const [y, m] = month.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const today = Number(giveawayDay().slice(8, 10));
  const daysLeft = daysInMonth - today + 1;
  const prize = GIVEAWAY_PRIZES[0];

  const steps = [
    {
      title: "Order Online",
      text: "Every online order adds an entry.",
      icon: (
        <svg viewBox="0 0 32 32" className="w-10 h-10" {...line}>
          <path d="M3 5h3l3 15h15l3-10H8M12 26a1.5 1.5 0 1 0 0-.1M22 26a1.5 1.5 0 1 0 0-.1" />
        </svg>
      ),
    },
    {
      title: "Get Entered",
      text: "Automatically, or enter for free below.",
      icon: (
        <svg viewBox="0 0 32 32" className="w-10 h-10" {...line}>
          <path d="M8 6h16l-2 22H10L8 6ZM7 3h18v3H7z" />
          <path d="M16 13.5c-1.5-2-4.5-.7-3 1.5l3 3 3-3c1.5-2.2-1.5-3.5-3-1.5Z" />
        </svg>
      ),
    },
    {
      title: "Win 2 Free Drinks",
      text: `One winner picked ${drawnOn}.`,
      icon: (
        <svg viewBox="0 0 32 32" className="w-10 h-10" {...line}>
          <path d="M5 12h22v5H5zM7 17h18v11H7zM16 12v16M16 12c-2-5-8-5-7-1 .5 1.5 4 1 7 1Zm0 0c2-5 8-5 7-1-.5 1.5-4 1-7 1Z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="pb-6">
      {/* Banner */}
      <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_70%_40%,#9c1d3d_0%,#7e1533_50%,#560c22_100%)] text-white">
        <svg viewBox="0 0 64 64" className="absolute -left-6 -top-6 w-32 rotate-[-20deg]" aria-hidden>
          <path fill="#e8a23a" d="M32 2 37 16l11-7-3 14 15-2-10 11 12 6-15 4 6 13-13-6-2 15-6-11-6 11-2-15-13 6 6-13-15-4 12-6L4 21l15 2-3-14 11 7Z" />
        </svg>
        <svg viewBox="0 0 64 64" className="absolute -right-6 -bottom-8 w-36 rotate-12" aria-hidden>
          <path fill="#d9661f" d="M32 2 37 16l11-7-3 14 15-2-10 11 12 6-15 4 6 13-13-6-2 15-6-11-6 11-2-15-13 6 6-13-15-4 12-6L4 21l15 2-3-14 11 7Z" />
        </svg>
        <div className="relative mx-auto max-w-6xl px-5 sm:px-8 py-12 sm:py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="font-script text-6xl sm:text-7xl leading-[0.95]">
              Chismesito
              <br />
              <span className="pl-10">Rewards ♡</span>
            </h1>
            <p className="mt-4 font-semibold text-white/90 sm:text-lg">
              Order online and you&apos;re automatically entered to win {prize.title.toLowerCase()}!
            </p>
            <p className="mt-1 text-sm text-white/70">{formatMonth(month)} · enter by {endsOn}</p>
          </div>

          {/* Rewards card */}
          <div className="justify-self-center md:justify-self-end w-full max-w-sm rotate-[-4deg] rounded-3xl bg-gradient-to-br from-berry to-wine p-1.5 shadow-2xl">
            <div className="rounded-[1.3rem] border-2 border-white/40 bg-gradient-to-br from-[#c8204f] to-[#8c1838] px-5 pt-4 pb-5">
              <div className="relative mx-auto w-36 h-20">
                <Image src="/images/logo-clear.png" alt="" fill sizes="144px" className="object-contain" />
              </div>
              <p className="mt-1 mx-auto w-fit rounded-md border border-white/50 px-6 py-0.5 text-xs font-bold tracking-[0.3em] text-white">REWARDS</p>
              <div className="mt-4 rounded-2xl bg-[#fff5f3] px-3 py-3 flex items-center justify-between">
                {[0, 1, 2, 3].map((i) => (
                  <CupBadge key={i} filled={false} />
                ))}
                <svg viewBox="0 0 32 32" className="w-10 h-10 text-berry" {...line}>
                  <path d="M5 12h22v5H5zM7 17h18v11H7zM16 12v16M16 12c-2-5-8-5-7-1 .5 1.5 4 1 7 1Zm0 0c2-5 8-5 7-1-.5 1.5-4 1-7 1Z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-8 -mt-6 relative">
        <div className="grid md:grid-cols-[1.4fr_1fr] gap-5">
          {/* Progress through the month */}
          <section className="card-soft p-6">
            <h2 className="font-bold text-lg text-ink">This Month&apos;s Giveaway</h2>
            <p className="mt-3">
              <span className="font-display font-bold text-4xl text-wine-dark">{daysLeft}</span>
              <span className="ml-2 text-ink/70">{daysLeft === 1 ? "day left to enter" : "days left to enter"}</span>
            </p>
            <div className="mt-4 h-3.5 rounded-full bg-blush overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-berry to-wine" style={{ width: `${Math.round((today / daysInMonth) * 100)}%` }} />
            </div>
            <p className="mt-3 text-center text-sm text-ink/70">
              Winner picked {drawnOn}. More orders = more chances ♡
            </p>
          </section>

          <section className="card-soft p-6">
            <h2 className="font-bold text-lg text-ink">Your Rewards</h2>
            <ul className="mt-3 divide-y divide-blush">
              <li className="flex items-center gap-4 py-3">
                <svg viewBox="0 0 32 32" className="w-9 h-9 shrink-0 text-berry" {...line}>
                  <path d="M5 12h22v5H5zM7 17h18v11H7zM16 12v16M16 12c-2-5-8-5-7-1 .5 1.5 4 1 7 1Zm0 0c2-5 8-5 7-1-.5 1.5-4 1-7 1Z" />
                </svg>
                <span>
                  <span className="block font-semibold text-ink">{prize.title}</span>
                  <span className="text-sm text-ink/60">{prize.detail}</span>
                </span>
              </li>
              <li className="flex items-center gap-4 py-3">
                <svg viewBox="0 0 32 32" className="w-9 h-9 shrink-0 text-berry" {...line}>
                  <path d="M9 5h14v6a7 7 0 0 1-14 0V5ZM9 7H5a4 4 0 0 0 4 6M23 7h4a4 4 0 0 1-4 6M16 18v5M11 27h10l-1-4h-8l-1 4Z" />
                </svg>
                <span>
                  <span className="block font-semibold text-ink">Exclusive Giveaways</span>
                  <span className="text-sm text-ink/60">A new winner every month</span>
                </span>
              </li>
            </ul>
          </section>
        </div>

        {/* How it works */}
        <section className="card-soft mt-5 p-6 sm:p-8">
          <h2 className="font-bold text-2xl text-ink">How It Works</h2>
          <div className="mt-6 grid sm:grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-6 text-center">
            {steps.map((s, i) => (
              <div key={s.title} className="contents">
                <div className="flex flex-col items-center gap-2 text-berry">
                  {s.icon}
                  <p className="font-bold text-ink">{s.title}</p>
                  <p className="text-sm text-ink/60 max-w-48">{s.text}</p>
                </div>
                {i < steps.length - 1 && <span className="hidden sm:block text-2xl text-ink/60">→</span>}
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap justify-center items-center gap-4">
            <Link href="/menu" className="rounded-full bg-berry hover:bg-berry-dark text-white font-semibold px-7 py-3 shadow-lg shadow-berry/25 transition-colors">
              Order Now &amp; Get Entered ›
            </Link>
            <Link href="/giveaway/rules" className="text-sm text-ink/60 underline hover:text-berry">
              Official rules
            </Link>
          </div>
        </section>

        {/* Free entry */}
        <section id="enter" className="card-soft mt-5 p-6 sm:p-8 grid md:grid-cols-[1fr_1.2fr] gap-6 scroll-mt-28">
          <div>
            <h2 className="font-bold text-2xl text-ink">Enter for free</h2>
            <p className="mt-2 text-ink/70">
              No purchase needed. One free entry per person each month, and every online order adds another.
            </p>
          </div>
          <GiveawayEntryForm />
        </section>
      </div>
    </div>
  );
}
