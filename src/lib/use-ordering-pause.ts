"use client";

import { useEffect, useState } from "react";

// Asks the server every 30 seconds whether staff paused online orders, and
// flips back on its own the moment the pause runs out.
export function useOrderingPause() {
  const [until, setUntil] = useState<string | null>(null);
  const [now, setNow] = useState(0);

  useEffect(() => {
    let alive = true;
    const check = () =>
      fetch("/api/ordering-status", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => alive && setUntil(d.pausedUntil ?? null))
        .catch(() => {});
    const tick = () => setNow(Date.now());
    const first = setTimeout(() => {
      check();
      tick();
    }, 0);
    const poll = setInterval(check, 30_000);
    const clock = setInterval(tick, 5_000);
    return () => {
      alive = false;
      clearTimeout(first);
      clearInterval(poll);
      clearInterval(clock);
    };
  }, []);

  const paused = !!until && now > 0 && Date.parse(until) > now;
  const backAt = paused ? new Date(until!).toLocaleTimeString("en-US", { timeZone: "America/Los_Angeles", hour: "numeric", minute: "2-digit" }) : "";
  return { paused, backAt };
}
