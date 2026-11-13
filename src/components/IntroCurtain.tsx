import Image from "next/image";
import type { CSSProperties } from "react";
import SeasonalSky from "./SeasonalSky";

// Opening screen shown once per browser session (see introScript in
// lib/season.ts, which sets <html data-intro>). Pure CSS: the logo pops in
// under twinkling lights, then a circle opens from the middle to reveal the
// site. Holiday dress (lights, wreath, "Felices Fiestas") only in holiday
// season; the rest of the year it's just the logo and steam.

const BULBS = ["#ff4d5e", "#ffd25e", "#4fd18b", "#5ab8ff", "#ff8ad1"];

function Lights() {
  const n = 14;
  return (
    <div className="only-holiday absolute inset-x-0 top-0" aria-hidden>
      <svg viewBox="0 0 1000 90" preserveAspectRatio="none" className="w-full h-16 sm:h-20">
        <path d="M0 10 Q 250 80 500 30 T 1000 10" fill="none" stroke="#2c4a2c" strokeWidth="3" />
      </svg>
      <div className="absolute inset-0">
        {Array.from({ length: n }, (_, i) => {
          const t = (i + 0.5) / n;
          // follow the wire's curve roughly
          const y = t < 0.5 ? 10 + 70 * Math.sin(t * Math.PI * 2) * 0.55 : 30 - 20 * (t - 0.5) * 2 + 25 * Math.sin((t - 0.5) * Math.PI * 2);
          return (
            <span
              key={i}
              className="bulb absolute block w-3.5 h-5 sm:w-4 sm:h-6 rounded-b-full rounded-t-[40%] -translate-x-1/2"
              style={
                {
                  left: `${t * 100}%`,
                  top: `calc(${(y / 90) * 100}% + 4px)`,
                  background: BULBS[i % BULBS.length],
                  color: BULBS[i % BULBS.length],
                  animationDelay: `${(i % 4) * 0.25}s`,
                } as CSSProperties
              }
            />
          );
        })}
      </div>
    </div>
  );
}

function Wreath() {
  const leaves = 22;
  return (
    <svg viewBox="0 0 200 200" className="only-holiday absolute inset-0 w-full h-full intro-wreath" aria-hidden>
      {Array.from({ length: leaves }, (_, i) => {
        const a = (i / leaves) * 360;
        return (
          <g key={i} transform={`rotate(${a} 100 100)`}>
            <ellipse cx="100" cy="14" rx="9" ry="17" fill={i % 2 ? "#2f7d4a" : "#3f9a5c"} transform={`rotate(${i % 2 ? 35 : -35} 100 14)`} />
          </g>
        );
      })}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2 + 0.3;
        return <circle key={i} cx={100 + Math.cos(a) * 86} cy={100 + Math.sin(a) * 86} r="6" fill="#e0263c" stroke="#fff" strokeOpacity=".5" />;
      })}
      {/* bow */}
      <g transform="translate(100 186)">
        <path d="M0 0 C-30 -18 -34 14 0 0 C30 -18 34 14 0 0Z" fill="#e0263c" />
        <path d="M-4 2 L-14 26 M4 2 L14 26" stroke="#e0263c" strokeWidth="6" strokeLinecap="round" />
        <circle r="6" fill="#b5182b" />
      </g>
    </svg>
  );
}

export default function IntroCurtain() {
  return (
    <div className="intro fixed inset-0 z-[100] items-center justify-center bg-[radial-gradient(ellipse_at_50%_45%,#a3203f_0%,#7e1533_45%,#3d0818_100%)] text-white" aria-hidden>
      <SeasonalSky />
      <Lights />
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <div className="intro-logo relative w-56 h-56 sm:w-64 sm:h-64">
          <Wreath />
          <svg viewBox="0 0 80 60" className="steam absolute left-1/2 -translate-x-1/2 top-2 w-16 h-12 text-white/70 z-10" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
            <path d="M26 56c-8-10 8-14 0-26s6-16 2-26" />
            <path d="M40 56c-8-10 8-14 0-26s6-16 2-26" />
            <path d="M54 56c-8-10 8-14 0-26s6-16 2-26" />
          </svg>
          <div className="absolute inset-[11%]">
            <Image src="/images/logo-clear.png" alt="" fill priority sizes="180px" className="object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,.4)]" />
          </div>
        </div>
        <p className="intro-line only-holiday mt-4 font-script text-5xl sm:text-6xl text-[#ffe3b8]">Felices Fiestas</p>
        <p className="intro-line not-holiday mt-4 font-script text-5xl sm:text-6xl text-[#ffe3b8]">Bienvenidos</p>
        <p className="intro-sub mt-2 text-sm font-semibold uppercase tracking-[0.3em] text-white/80">Coffee with a little chisme</p>
      </div>
    </div>
  );
}
