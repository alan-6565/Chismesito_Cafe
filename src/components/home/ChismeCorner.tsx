import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";

// "Coffee with a little chisme" — the cafe's cup with steam curling off it,
// surrounded by overheard-at-the-counter speech bubbles that pop in as you
// scroll. A teaser for the Our Story page.

const BUBBLES: { text: string; pos: string; r: number; tone: "berry" | "cream" | "wine" }[] = [
  { text: "¿Ya supiste…? 👀", pos: "left-0 top-2 sm:-left-4", r: -6, tone: "berry" },
  { text: "They open at 6 now?!", pos: "right-0 top-10 sm:-right-2", r: 5, tone: "cream" },
  { text: "Girl, get the Tres Leches 😍", pos: "-left-2 bottom-24 sm:-left-10", r: 4, tone: "cream" },
  { text: "Holiday menu just dropped ❄", pos: "right-0 bottom-16 sm:-right-8", r: -4, tone: "wine" },
  { text: "Meet me at Chismesito ♡", pos: "left-1/2 -translate-x-1/2 -bottom-2", r: -2, tone: "berry" },
];

const TONES = {
  berry: "bg-berry text-white after:border-t-berry",
  cream: "bg-[#fff8ef] text-wine-dark border border-blush after:border-t-[#fff8ef]",
  wine: "bg-wine text-[#fff3e6] after:border-t-wine",
};

function Steam() {
  return (
    <svg viewBox="0 0 80 60" className="steam absolute left-1/2 -translate-x-1/2 -top-10 w-24 h-16 text-wine/40" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" aria-hidden>
      <path d="M26 56c-8-10 8-14 0-26s6-16 2-26" />
      <path d="M40 56c-8-10 8-14 0-26s6-16 2-26" />
      <path d="M54 56c-8-10 8-14 0-26s6-16 2-26" />
    </svg>
  );
}

export default function ChismeCorner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-cream via-blush-soft/70 to-cream py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-14 items-center">
        <Reveal>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-berry">Our story</p>
          <h2 className="mt-2 font-display font-bold text-4xl sm:text-6xl text-wine-dark leading-[1.02]">
            Coffee with a little <span className="font-script text-berry text-5xl sm:text-7xl">chisme</span>
          </h2>
          <p className="mt-5 max-w-lg text-ink/75 sm:text-lg leading-relaxed">
            What started as a dream between friends turned into a cozy corner of Richmond where neighbors stop in for their daily
            cup — and stay for the conversation. Pull up a chair, the tea is hot.
          </p>
          <Link
            href="/about"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-wine px-7 py-3 font-semibold text-white shadow-lg shadow-wine/25 hover:bg-wine-dark transition-colors"
          >
            Read our story →
          </Link>
        </Reveal>

        <div className="relative mx-auto w-full max-w-md aspect-square">
          {/* Glow + cup */}
          <div className="absolute inset-[14%] rounded-full bg-[radial-gradient(circle,#fff_0%,rgba(255,255,255,.6)_45%,transparent_70%)]" />
          <div className="absolute inset-[22%] bob" style={{ ["--r" as string]: "0deg" }}>
            <Steam />
            <Image src="/images/logo-clear.png" alt="" fill sizes="260px" className="object-contain drop-shadow-[0_18px_24px_rgba(95,15,38,.25)]" />
          </div>

          {BUBBLES.map((b, i) => (
            <div key={b.text} className={`absolute ${b.pos} z-10`}>
              <Reveal pop rotate={b.r} delay={200 + i * 180}>
                <span
                  className={`relative inline-block rounded-2xl px-4 py-2.5 text-sm sm:text-[15px] font-semibold shadow-lg whitespace-nowrap after:absolute after:left-6 after:top-full after:border-[8px] after:border-transparent ${TONES[b.tone]}`}
                >
                  {b.text}
                </span>
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
