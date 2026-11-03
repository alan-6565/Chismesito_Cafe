"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { SearchIcon } from "./icons";

// The mockup's five tabs, plus Order Online and Gallery which the client kept.
const links = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/giveaway", label: "Rewards" },
  { href: "/about", label: "Our Story" },
  { href: "/contact", label: "Visit Us" },
  { href: "/order", label: "Order Online" },
  { href: "/gallery", label: "Gallery" },
];

function CartGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 4h2l2.4 10.2a1.5 1.5 0 0 0 1.5 1.1h8.3a1.5 1.5 0 0 0 1.4-1l2-6.3H6.2" />
      <circle cx="9.5" cy="19.5" r="1.3" />
      <circle cx="17" cy="19.5" r="1.3" />
    </svg>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { totalItems, open: openCart } = useCart();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const icons = (
    <div className="flex items-center gap-4 text-maroon">
      <Link href="/menu?search=1" aria-label="Search the menu" className="hover:text-berry transition-colors">
        <SearchIcon className="w-6 h-6" />
      </Link>
      <button aria-label="Open cart" onClick={openCart} className="relative hover:text-berry transition-colors">
        <CartGlyph className="w-7 h-7" />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-berry text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-cream">
            {totalItems}
          </span>
        )}
      </button>
    </div>
  );

  return (
    <header className="sticky top-0 z-40">
      {/* The wine band across the top, like the mockup */}
      <div className="h-2.5 bg-gradient-to-r from-wine-dark via-wine to-wine-dark" />
      <div className="bg-cream/95 backdrop-blur shadow-[0_6px_20px_rgba(126,21,51,0.08)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-6 h-20">
          <Link href="/" aria-label="Chismesito Cafe home" className="relative shrink-0 w-28 h-[4.25rem]">
            <Image src="/images/logo-clear.png" alt="Chismesito Cafe" fill sizes="112px" priority className="object-contain" />
          </Link>

          <nav className="hidden lg:flex items-center gap-7 text-[15px] font-semibold text-maroon">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`relative py-2 transition-colors hover:text-berry ${isActive(l.href) ? "text-maroon after:absolute after:inset-x-0 after:-bottom-0.5 after:h-[3px] after:rounded-full after:bg-berry" : ""}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:block">{icons}</div>

          <div className="flex items-center gap-5 lg:hidden">
            {icons}
            <button aria-label="Toggle menu" className="text-maroon text-2xl" onClick={() => setOpen((v) => !v)}>
              {open ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {open && (
          <nav className="lg:hidden border-t border-blush bg-cream px-4 py-3 flex flex-col font-semibold text-maroon">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`py-3 border-b border-blush/60 last:border-0 ${isActive(l.href) ? "text-berry" : ""}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
