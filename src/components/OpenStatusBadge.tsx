"use client";

import { useEffect, useState } from "react";
import { isOpenNow } from "@/lib/hours";

// Starts as null and resolves on mount rather than during the initial
// render — avoids a hydration mismatch if the server render and the
// client's first paint happen to straddle a minute boundary.
export default function OpenStatusBadge({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState<boolean | null>(null);

  useEffect(() => {
    const update = () => setOpen(isOpenNow());
    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, []);

  if (open === null) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        open ? "bg-emerald-100 text-emerald-700" : "bg-ink/10 text-ink/50"
      } ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${open ? "bg-emerald-600" : "bg-ink/40"}`} />
      {open ? "Open Now" : "Closed"}
    </span>
  );
}
