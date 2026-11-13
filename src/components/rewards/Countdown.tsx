"use client";

import { useEffect, useState } from "react";

// Live days / hours / minutes / seconds until entries close (midnight Pacific
// at the end of the month). Blank until mounted so server and client agree.
export default function Countdown({ endsAt }: { endsAt: string }) {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const end = new Date(endsAt).getTime();
    const tick = () => setLeft(Math.max(0, end - Date.now()));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [endsAt]);

  const s = left === null ? null : Math.floor(left / 1000);
  const parts = [
    { label: "days", v: s === null ? null : Math.floor(s / 86400) },
    { label: "hrs", v: s === null ? null : Math.floor((s % 86400) / 3600) },
    { label: "min", v: s === null ? null : Math.floor((s % 3600) / 60) },
    { label: "sec", v: s === null ? null : s % 60 },
  ];

  return (
    <div className="flex gap-2 sm:gap-3" role="timer" aria-label="Time left to enter">
      {parts.map((p) => (
        <div key={p.label} className="w-16 sm:w-20 rounded-2xl bg-white/12 border border-white/25 backdrop-blur px-2 py-3 text-center shadow-inner">
          <span className="block font-display font-black text-3xl sm:text-4xl tabular-nums leading-none">
            {p.v === null ? "–" : String(p.v).padStart(2, "0")}
          </span>
          <span className="mt-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">{p.label}</span>
        </div>
      ))}
    </div>
  );
}
