"use client";

import { useEffect, useState } from "react";
import { openingHours } from "@/lib/data";
import { formatTime, isOpenNow } from "@/lib/hours";

// The hours as a little sign, styled after the cafe's "New Hours" post, with
// today's row lit up. Reads the same openingHours that drive pickup times.

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DOW = [1, 2, 3, 4, 5, 6, 0];

function todayDow() {
  const name = new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", weekday: "long" }).format(new Date());
  return ["Sunday", ...DAYS.slice(0, 6)].indexOf(name);
}

export default function HoursBoard() {
  const [today, setToday] = useState<number | null>(null);
  const [open, setOpen] = useState<boolean | null>(null);

  useEffect(() => {
    const tick = () => {
      setToday(todayDow());
      setOpen(isOpenNow());
    };
    tick();
    const t = setInterval(tick, 60_000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative rounded-[1.75rem] bg-[#fdf6ec] p-2 shadow-[0_20px_40px_-18px_rgba(70,10,20,.35)]">
      <div className="rounded-[1.4rem] border-[1.5px] border-wine/30 px-5 sm:px-7 py-6 bg-[repeating-linear-gradient(90deg,transparent_0_14px,rgba(126,21,51,.025)_14px_28px)]">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display font-black text-2xl sm:text-3xl tracking-wide text-wine-dark uppercase">Hours</h3>
          {open !== null && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                open ? "bg-emerald-100 text-emerald-700" : "bg-wine/10 text-wine"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${open ? "bg-emerald-500 animate-pulse" : "bg-wine/50"}`} />
              {open ? "Open now" : "Closed now"}
            </span>
          )}
        </div>
        <div className="mt-2 h-[2px] bg-wine/70" />
        <ul className="mt-3 space-y-0.5">
          {DAYS.map((d, i) => {
            const dow = DOW[i];
            const h = openingHours.find((s) => s.days.includes(dow));
            const isToday = today === dow;
            return (
              <li
                key={d}
                className={`flex items-center justify-between gap-4 rounded-xl px-3 py-1.5 font-display uppercase tracking-wide text-[15px] transition-colors ${
                  isToday ? "bg-wine text-[#fff4ea] shadow-md" : "text-wine-dark"
                }`}
              >
                <span className="font-bold">
                  {d}
                  {isToday && <span className="ml-2 align-middle font-body normal-case tracking-normal text-[11px] font-semibold opacity-80">today</span>}
                </span>
                <span className="tabular-nums">{h ? `${formatTime(h.opens)} – ${formatTime(h.closes)}` : "Closed"}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
