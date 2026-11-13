"use client";

import { useEffect, useState } from "react";
import { getTodayScheduleLabel, isOpenNow } from "@/lib/hours";

// "Open Now · Closes at 5:00 PM" as a glowing pill (resolves after mount to
// avoid a server/client mismatch around the minute boundary).
export default function OpenPill({ className = "" }: { className?: string }) {
  const [s, setS] = useState<{ open: boolean; label: string } | null>(null);

  useEffect(() => {
    const tick = () => setS({ open: isOpenNow(), label: getTodayScheduleLabel() });
    tick();
    const t = setInterval(tick, 60_000);
    return () => clearInterval(t);
  }, []);

  if (!s) return <span className={`inline-block h-9 ${className}`} />;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold backdrop-blur ${
        s.open ? "bg-emerald-500/90 text-white shadow-[0_0_24px_rgba(16,185,129,.55)]" : "bg-white/85 text-wine-dark"
      } ${className}`}
    >
      <span className={`h-2.5 w-2.5 rounded-full ${s.open ? "bg-white animate-pulse" : "bg-wine/50"}`} />
      {s.label}
    </span>
  );
}
