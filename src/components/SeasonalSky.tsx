import type { CSSProperties } from "react";

// Drifting snowflakes (holiday) or maple leaves (fall) laid over a section.
// Purely decorative, CSS-animated, hidden for reduced-motion users.
// Positions come from a fixed list (not Math.random) so server and client match.

const SPOTS = [
  [4, 0, 11, 26], [12, 3.5, 14, 18], [21, 7, 10, 22], [29, 1.2, 13, 16], [37, 5.5, 12, 24],
  [46, 2.4, 15, 14], [54, 8.5, 11, 20], [62, 0.6, 13, 26], [70, 4.6, 12, 18], [78, 9.2, 14, 22],
  [86, 2, 10, 16], [94, 6.4, 13, 24], [8, 10.5, 12, 14], [42, 11.5, 14, 18], [66, 12.4, 11, 20],
  [90, 13.2, 13, 15],
] as const;

function Snowflake({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
      <path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M9.5 3.8 12 6l2.5-2.2M9.5 20.2 12 18l2.5 2.2" />
    </svg>
  );
}

function Maple({ size, color }: { size: number; color: string }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden>
      <path fill={color} d="M32 2 37 16l11-7-3 14 15-2-10 11 12 6-15 4 6 13-13-6-2 15-6-11-6 11-2-15-13 6 6-13-15-4 12-6L4 21l15 2-3-14 11 7Z" />
    </svg>
  );
}

const LEAF_COLORS = ["#e8a23a", "#c4451f", "#d9661f", "#b8642a"];

export default function SeasonalSky({ density = 1 }: { density?: number }) {
  const spots = SPOTS.slice(0, Math.round(SPOTS.length * density));
  const style = (left: number, delay: number, dur: number, i: number) =>
    ({
      left: `${left}%`,
      "--delay": `-${delay}s`,
      "--dur": `${dur}s`,
      "--drift": `${i % 2 ? -40 : 40}px`,
      "--spin": `${i % 3 ? 220 : -180}deg`,
    }) as CSSProperties;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-[5]" aria-hidden>
      <div className="only-holiday">
        {spots.map(([left, delay, dur, size], i) => (
          <span key={i} className="flake drop-shadow-[0_1px_2px_rgba(80,10,20,.35)]" style={{ ...style(left, delay, dur, i), opacity: 0.9 }}>
            <Snowflake size={size} />
          </span>
        ))}
      </div>
      <div className="only-fall">
        {spots.slice(0, 10).map(([left, delay, dur, size], i) => (
          <span key={i} className="flake" style={style(left, delay, dur + 4, i)}>
            <Maple size={size + 6} color={LEAF_COLORS[i % LEAF_COLORS.length]} />
          </span>
        ))}
      </div>
    </div>
  );
}
