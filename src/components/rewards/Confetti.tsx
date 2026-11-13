import type { CSSProperties } from "react";

// A one-shot burst of confetti (pure CSS). Positions are fixed, not random,
// so it renders the same everywhere. Skipped for reduced-motion users.
const COLORS = ["#c41e57", "#f2b33d", "#2a9d8f", "#7e1533", "#e46d93", "#5aa9e6", "#ffe3b8"];

export default function Confetti({ pieces = 36 }: { pieces?: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-visible">
      {Array.from({ length: pieces }, (_, i) => {
        const angle = (i / pieces) * Math.PI * 2;
        const dist = 90 + ((i * 37) % 80);
        const style = {
          "--tx": `${Math.cos(angle) * dist}px`,
          "--ty": `${Math.sin(angle) * dist - 60}px`,
          "--rot": `${(i * 47) % 360}deg`,
          background: COLORS[i % COLORS.length],
          animationDelay: `${(i % 6) * 30}ms`,
          width: i % 3 ? 8 : 6,
          height: i % 3 ? 12 : 6,
          borderRadius: i % 3 ? 2 : 999,
        } as CSSProperties;
        return <span key={i} className="confetti absolute left-1/2 top-1/2" style={style} />;
      })}
    </div>
  );
}
