"use client";

import { createContext, ReactNode, useContext, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CupIcon, GridIcon, ReceiptIcon, LogoutIcon } from "@/components/icons";

// Lets the Orders page push its "new orders" count up to the sidebar badge.
const NewOrderCountContext = createContext<(count: number) => void>(() => {});
export const useSetNewOrderCount = () => useContext(NewOrderCountContext);

const NAV = [
  { href: "/admin/orders", label: "Orders", Icon: GridIcon },
  { href: "/admin/menu", label: "Menu", Icon: CupIcon },
  { href: "/admin/billing", label: "Billing", Icon: ReceiptIcon },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [newCount, setNewCount] = useState(0);

  if (pathname === "/admin/login") return children;

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <NewOrderCountContext.Provider value={setNewCount}>
      <div className="min-h-screen lg:flex">
        <aside className="lg:w-60 lg:shrink-0 lg:border-r border-b lg:border-b-0 border-blush bg-cream-alt/40">
          <div className="lg:sticky lg:top-0 lg:h-screen flex lg:flex-col gap-2 px-4 py-3 lg:px-5 lg:py-8 items-center lg:items-stretch overflow-x-auto">
            <div className="relative shrink-0 w-10 h-10 lg:w-28 lg:h-28 lg:mx-auto lg:mb-8 rounded-full overflow-hidden border-2 border-blush shadow-sm bg-cream">
              <Image src="/images/logo.png" alt="Chismesito Cafe logo" fill sizes="112px" className="object-cover" />
            </div>

            <nav className="flex lg:flex-col gap-1 lg:gap-2">
              {NAV.map(({ href, label, Icon }) => {
                const active = pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`shrink-0 flex items-center gap-3 rounded-xl px-3 lg:px-4 py-2 lg:py-3 text-sm font-medium transition-colors ${
                      active ? "bg-maroon text-cream" : "text-maroon hover:bg-blush-soft"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                    {href === "/admin/orders" && newCount > 0 && (
                      <span
                        className={`ml-auto min-w-6 h-6 px-1.5 rounded-full text-xs font-bold flex items-center justify-center ${
                          active ? "bg-cream text-maroon" : "bg-rose text-white"
                        }`}
                      >
                        {newCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={logout}
              className="shrink-0 ml-auto lg:ml-0 lg:mt-auto flex items-center gap-3 rounded-xl px-3 lg:px-4 py-2 lg:py-3 text-sm font-medium text-ink/60 hover:text-rose hover:bg-blush-soft transition-colors"
            >
              <LogoutIcon className="w-5 h-5" />
              Log out
            </button>
          </div>
        </aside>

        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </NewOrderCountContext.Provider>
  );
}
