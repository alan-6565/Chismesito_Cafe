"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import Reveal from "@/components/Reveal";

export type WallPhoto = { src: string; alt: string; tag: string; w: number; h: number; href?: string };

const FILTERS = ["All", "Drinks", "The Cafe", "Our People"];

// A pinned-up photo wall (masonry, slight tilts) with filters and a full-screen
// viewer: arrows, keyboard ← → Esc, and swipe on phones.
export default function GalleryWall({ photos }: { photos: WallPhoto[] }) {
  const [filter, setFilter] = useState("All");
  const [open, setOpen] = useState<number | null>(null);
  const shown = filter === "All" ? photos : photos.filter((p) => p.tag === filter);
  const counts = Object.fromEntries(FILTERS.map((f) => [f, f === "All" ? photos.length : photos.filter((p) => p.tag === f).length]));

  const go = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + shown.length) % shown.length)), [shown.length]);

  return (
    <>
      <div className="flex flex-wrap justify-center gap-2.5">
        {FILTERS.filter((f) => counts[f] > 0).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
              filter === f ? "bg-wine text-white shadow-md shadow-wine/25 scale-[1.03]" : "bg-white text-ink border border-blush/70 hover:text-berry"
            }`}
          >
            {f} <span className={filter === f ? "text-white/70" : "text-ink/40"}>{counts[f]}</span>
          </button>
        ))}
      </div>

      <div key={filter} className="mt-10 columns-2 md:columns-3 lg:columns-4 gap-5 [column-fill:balance]">
        {shown.map((p, i) => (
          <Reveal key={p.src} delay={(i % 4) * 80} className="mb-5 break-inside-avoid">
            <button
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`Open photo: ${p.alt}`}
              style={{ rotate: `${((i % 5) - 2) * 0.9}deg` }}
              className="group block w-full bg-white p-2 pb-9 shadow-[0_14px_30px_-14px_rgba(74,15,34,.45)] transition-all duration-300 hover:!rotate-0 hover:-translate-y-1.5 hover:shadow-[0_24px_40px_-16px_rgba(74,15,34,.55)] relative"
            >
              <span className="relative block overflow-hidden bg-blush-soft" style={{ aspectRatio: `${p.w} / ${p.h}` }}>
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </span>
              <span className="absolute bottom-2 inset-x-2 truncate text-center font-script text-lg text-wine">{p.alt}</span>
              {i % 3 === 0 && <span aria-hidden className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-16 h-5 rotate-[-4deg] bg-berry/30" />}
            </button>
          </Reveal>
        ))}
      </div>

      {open !== null && shown[open] && <Viewer photo={shown[open]} index={open} total={shown.length} onClose={() => setOpen(null)} onStep={go} />}
    </>
  );
}

function Viewer({
  photo,
  index,
  total,
  onClose,
  onStep,
}: {
  photo: WallPhoto;
  index: number;
  total: number;
  onClose: () => void;
  onStep: (d: number) => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const startX = useRef<number | null>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onStep(1);
      if (e.key === "ArrowLeft") onStep(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, onStep]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={photo.alt}
      className="fixed inset-0 z-[60] bg-[#1d070d]/92 backdrop-blur-sm flex flex-col"
      onPointerDown={(e) => (startX.current = e.clientX)}
      onPointerUp={(e) => {
        if (startX.current === null) return;
        const dx = e.clientX - startX.current;
        startX.current = null;
        if (Math.abs(dx) > 50) onStep(dx < 0 ? 1 : -1);
      }}
    >
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 text-white">
        <span className="text-sm font-semibold text-white/70 tabular-nums">
          {index + 1} / {total}
        </span>
        <button ref={closeRef} onClick={onClose} aria-label="Close" className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-2xl leading-none">
          ×
        </button>
      </div>

      <div className="relative flex-1 min-h-0 mx-4 sm:mx-20">
        <Image key={photo.src} src={photo.src} alt={photo.alt} fill sizes="100vw" className="object-contain animate-[fadein_.35s_ease]" />
      </div>

      <div className="px-4 py-5 text-center text-white">
        <p className="font-script text-2xl sm:text-3xl text-[#ffe3b8]">{photo.alt}</p>
        {photo.href && (
          <Link href={photo.href} className="mt-3 inline-block rounded-full bg-berry px-6 py-2.5 text-sm font-semibold hover:bg-berry-dark transition-colors">
            Order this →
          </Link>
        )}
      </div>

      {total > 1 && (
        <>
          <button
            onClick={() => onStep(-1)}
            aria-label="Previous photo"
            className="hidden sm:grid absolute left-4 top-1/2 -translate-y-1/2 place-items-center w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white text-2xl"
          >
            ‹
          </button>
          <button
            onClick={() => onStep(1)}
            aria-label="Next photo"
            className="hidden sm:grid absolute right-4 top-1/2 -translate-y-1/2 place-items-center w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white text-2xl"
          >
            ›
          </button>
        </>
      )}
    </div>
  );
}
