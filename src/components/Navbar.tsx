"use client";

import Link from "next/link";
import { useState } from "react";
import Logo from "./Logo";
import OpenStatusBadge from "./OpenStatusBadge";
import { business } from "@/lib/data";
import { useCart } from "@/lib/cart-context";

const links = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/about", label: "About Us" },
  { href: "/order", label: "Order Online" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { totalItems, open: openCart } = useCart();

  const CartButton = ({ className = "" }: { className?: string }) => (
    <button
      aria-label="Open cart"
      onClick={openCart}
      className={`relative text-2xl text-maroon ${className}`}
    >
      🛒
      {totalItems > 0 && (
        <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-rose text-white text-[10px] font-semibold flex items-center justify-center">
          {totalItems}
        </span>
      )}
    </button>
  );

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur border-b border-blush">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
        <Link href="/" className="flex items-center gap-3">
          <Logo size="sm" />
          <span className="font-display font-bold text-lg text-maroon hidden sm:inline">
            {business.name}
          </span>
          <OpenStatusBadge className="hidden sm:inline-flex" />
        </Link>

        <nav className="hidden lg:flex items-center gap-7 font-medium text-sm text-maroon">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-rose transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/order"
            className="rounded-full bg-rose hover:bg-rose-dark text-white text-sm font-semibold px-5 py-2.5 transition-colors"
          >
            Order Now
          </Link>
          <CartButton />
        </div>

        <div className="flex items-center gap-4 lg:hidden">
          <CartButton />
          <button
            aria-label="Toggle menu"
            className="text-maroon text-2xl"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {open && (
        <nav className="lg:hidden border-t border-blush bg-cream px-4 py-4 flex flex-col gap-1 font-medium text-maroon">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="py-2.5 border-b border-blush/60 last:border-0"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/order"
            onClick={() => setOpen(false)}
            className="mt-3 rounded-full bg-rose text-white text-center font-semibold px-5 py-2.5"
          >
            Order Now
          </Link>
        </nav>
      )}
    </header>
  );
}
