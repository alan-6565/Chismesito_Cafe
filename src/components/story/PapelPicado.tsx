import type { CSSProperties } from "react";

// A string of papel picado flags in the logo's colors, swaying gently.
const COLORS = ["#c41e57", "#f2b33d", "#2a9d8f", "#7e1533", "#e46d93", "#5aa9e6"];

function Flag({ color, i }: { color: string; i: number }) {
  const cut = "#fdf6ef";
  return (
    <svg
      viewBox="0 0 60 74"
      className="papel w-12 sm:w-16 shrink-0 drop-shadow-[0_4px_4px_rgba(60,10,20,.15)]"
      style={{ "--sway-delay": `${(i % 6) * -0.4}s` } as CSSProperties}
      aria-hidden
    >
      <path d="M2 4h56v58l-5 6-5-6-5 6-5-6-5 6-5-6-5 6-5-6-5 6-6-6Z" fill={color} />
      {/* Cut-outs: a flower, little hearts and a border of dots */}
      <circle cx="30" cy="32" r="6" fill={cut} />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <ellipse key={a} cx="30" cy="20" rx="3.2" ry="5.5" fill={cut} transform={`rotate(${a} 30 32)`} />
      ))}
      <circle cx="30" cy="32" r="2.4" fill={color} />
      <path d="M12 52c-1.6-2.2-4.8-.8-3.2 1.6L12 57l3.2-3.4c1.6-2.4-1.6-3.8-3.2-1.6ZM48 52c-1.6-2.2-4.8-.8-3.2 1.6L48 57l3.2-3.4c1.6-2.4-1.6-3.8-3.2-1.6Z" fill={cut} />
      {[10, 20, 30, 40, 50].map((x) => (
        <circle key={x} cx={x} cy="9" r="1.6" fill={cut} />
      ))}
    </svg>
  );
}

export default function PapelPicado({ count = 18 }: { count?: number }) {
  return (
    <div className="pointer-events-none relative w-full overflow-hidden" aria-hidden>
      {/* the string */}
      <svg viewBox="0 0 100 6" preserveAspectRatio="none" className="absolute inset-x-0 top-0 w-full h-4">
        <path d="M0 1Q50 7 100 1" fill="none" stroke="#7e1533" strokeOpacity=".35" strokeWidth=".4" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="flex justify-center gap-1 sm:gap-2 pt-0.5">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} style={{ marginTop: `${Math.sin((i / (count - 1)) * Math.PI) * 14}px` }}>
            <Flag color={COLORS[i % COLORS.length]} i={i} />
          </div>
        ))}
      </div>
    </div>
  );
}
