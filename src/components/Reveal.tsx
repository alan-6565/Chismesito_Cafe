"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

// Fades/slides children in the first time they scroll into view.
// `pop` gives the bouncy speech-bubble entrance instead.
export default function Reveal({
  children,
  delay = 0,
  pop = false,
  rotate,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  pop?: boolean;
  rotate?: number;
  className?: string;
  as?: "div" | "li" | "section";
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      el.classList.add("is-in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const style = { "--reveal-delay": `${delay}ms`, ...(rotate !== undefined ? { "--r": `${rotate}deg` } : {}) } as CSSProperties;

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag ref={ref as any} style={style} className={`reveal ${pop ? "pop" : ""} ${className}`}>
      {children}
    </Tag>
  );
}
