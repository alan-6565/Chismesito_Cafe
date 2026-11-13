"use client";

import Image from "next/image";
import { useRef, type CSSProperties } from "react";

// A ticket for this month's prize that tilts toward the pointer and
// catches a moving shine. Mouse/pen only — touch just shows it still.
export default function PrizeTicket({ prize, detail, month, drawnOn }: { prize: string; detail: string; month: string; drawnOn: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.setProperty("--rx", `${(-y * 14).toFixed(2)}deg`);
    ref.current.style.setProperty("--ry", `${(x * 18).toFixed(2)}deg`);
    ref.current.style.setProperty("--sx", `${((x + 0.5) * 100).toFixed(1)}%`);
    ref.current.style.setProperty("--sy", `${((y + 0.5) * 100).toFixed(1)}%`);
  };
  const leave = () => {
    ref.current?.style.setProperty("--rx", "0deg");
    ref.current?.style.setProperty("--ry", "0deg");
  };

  return (
    <div className="[perspective:900px] w-full max-w-md">
      <div
        ref={ref}
        onPointerMove={move}
        onPointerLeave={leave}
        style={{ "--rx": "0deg", "--ry": "0deg", "--sx": "50%", "--sy": "30%" } as CSSProperties}
        className="relative -rotate-3 transition-transform duration-200 ease-out [transform:rotateX(var(--rx))_rotateY(var(--ry))_rotate(-3deg)] [transform-style:preserve-3d]"
      >
        <div className="relative flex rounded-3xl bg-[#fff8ee] text-wine-dark shadow-[0_30px_60px_-20px_rgba(0,0,0,.55)] overflow-hidden">
          {/* main part */}
          <div className="relative flex-1 p-6 sm:p-7">
            <div aria-hidden className="absolute inset-2 rounded-[1.1rem] border-2 border-dashed border-wine/20" />
            <p className="relative text-[11px] font-bold uppercase tracking-[0.3em] text-berry">Admit one winner ♡</p>
            <p className="relative mt-2 font-bubble text-5xl sm:text-6xl leading-[0.9] text-wine">
              {prize.split(" ").slice(0, 2).join(" ")}
              <br />
              <span className="text-berry">{prize.split(" ").slice(2).join(" ") || "!"}</span>
            </p>
            <p className="relative mt-2 text-sm font-semibold text-ink/70">{detail}</p>
            <div className="relative mt-4 flex items-center gap-3 text-xs font-semibold text-ink/60">
              <span className="rounded-full bg-blush-soft px-3 py-1 text-wine">{month}</span>
              <span>Drawn {drawnOn}</span>
            </div>
          </div>
          {/* perforation */}
          <div aria-hidden className="relative w-0 border-l-[3px] border-dotted border-wine/25 my-4" />
          <span aria-hidden className="absolute right-[5.25rem] sm:right-24 -top-3 w-6 h-6 rounded-full bg-wine" />
          <span aria-hidden className="absolute right-[5.25rem] sm:right-24 -bottom-3 w-6 h-6 rounded-full bg-wine" />
          {/* stub */}
          <div className="relative w-24 sm:w-28 shrink-0 bg-blush-soft flex flex-col items-center justify-center gap-2 py-5">
            <div className="relative w-16 h-12">
              <Image src="/images/logo-clear.png" alt="" fill sizes="64px" className="object-contain" />
            </div>
            <p className="[writing-mode:vertical-rl] rotate-180 text-[10px] font-bold uppercase tracking-[0.3em] text-wine/70">Chismesito · Giveaway</p>
          </div>
          {/* moving shine */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 mix-blend-soft-light"
            style={{ background: "radial-gradient(circle at var(--sx) var(--sy), rgba(255,255,255,.85), transparent 45%)" }}
          />
        </div>
      </div>
    </div>
  );
}
