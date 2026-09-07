"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { PromoSlide } from "@/lib/data";

export default function PromoCarousel({
  slides,
  intervalMs = 5000,
}: {
  slides: PromoSlide[];
  intervalMs?: number;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), intervalMs);
    return () => clearInterval(timer);
  }, [slides.length, intervalMs]);

  if (slides.length === 0) return null;

  const slide = slides[index];
  const image = (
    <div className="relative w-full aspect-[2484/1032] rounded-3xl overflow-hidden">
      <Image src={slide.image} alt={slide.alt} fill sizes="100vw" className="object-cover" priority />
    </div>
  );

  return (
    <div className="relative">
      {slide.href ? <Link href={slide.href}>{image}</Link> : image}

      {slides.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((s, i) => (
            <button
              key={s.id}
              aria-label={`Show slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === index ? "bg-rose" : "bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
