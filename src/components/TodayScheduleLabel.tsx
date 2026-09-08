"use client";

import { useEffect, useState } from "react";
import { isOpenNow, getTodayScheduleLabel } from "@/lib/hours";

// Same mount-then-resolve pattern as OpenStatusBadge, to avoid a hydration
// mismatch if the server render and the client's first paint straddle a
// minute boundary.
export default function TodayScheduleLabel({ className = "" }: { className?: string }) {
  const [state, setState] = useState<{ open: boolean; label: string } | null>(null);

  useEffect(() => {
    const update = () => setState({ open: isOpenNow(), label: getTodayScheduleLabel() });
    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, []);

  if (!state) return null;

  return (
    <p className={`font-semibold ${state.open ? "text-emerald-600" : "text-ink/50"} ${className}`}>
      {state.label}
    </p>
  );
}
