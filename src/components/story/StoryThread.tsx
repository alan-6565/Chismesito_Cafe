"use client";

import { useEffect, useRef, type ReactNode } from "react";

// Wraps the story chapters and draws a dotted "thread" down the middle that
// fills in as you scroll, with a little cup riding the tip.
export default function StoryThread({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const mid = window.innerHeight * 0.55;
      const p = Math.min(1, Math.max(0, (mid - r.top) / r.height));
      el.style.setProperty("--thread", String(p));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="relative" style={{ ["--thread" as string]: 0 }}>
      {/* Track + filled part (left on phones, centered on desktop) */}
      <div aria-hidden className="absolute top-0 bottom-0 left-5 md:left-1/2 md:-translate-x-1/2 w-[3px]">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgba(126,21,51,.18)_0_6px,transparent_6px_12px)]" />
        <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-berry to-wine rounded-full" style={{ height: "calc(var(--thread) * 100%)" }} />
        <div
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 grid place-items-center w-9 h-9 rounded-full bg-white shadow-md ring-2 ring-berry text-lg"
          style={{ top: "calc(var(--thread) * 100%)" }}
        >
          ☕
        </div>
      </div>
      {children}
    </div>
  );
}
