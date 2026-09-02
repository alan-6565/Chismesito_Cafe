"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/menu", label: "Menu", icon: "☕" },
  { href: "/order", label: "Order", icon: "🛍" },
  { href: "/contact", label: "Visit", icon: "📍" },
];

export default function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-maroon text-cream border-t border-blush/30">
      <div className="grid grid-cols-4">
        {tabs.map((t) => {
          const active = pathname === t.href;
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`flex flex-col items-center justify-center gap-0.5 py-2.5 text-xs font-medium ${
                active ? "text-rose" : "text-cream/80"
              }`}
            >
              <span className="text-lg leading-none">{t.icon}</span>
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
