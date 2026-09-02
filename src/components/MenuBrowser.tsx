"use client";

import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import type { MenuItemFull } from "@/lib/menu";

export default function MenuBrowser({
  items,
  categories,
}: {
  items: MenuItemFull[];
  categories: string[];
}) {
  const [active, setActive] = useState<string>("All");

  const visible = active === "All" ? items : items.filter((i) => i.category === active);

  return (
    <>
      <div className="mt-8 flex gap-2 overflow-x-auto pb-2 flex-nowrap sm:flex-wrap sm:justify-center sm:overflow-visible -mx-4 px-4 sm:mx-0 sm:px-0">
        {["All", ...categories].map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
              active === c
                ? "bg-rose text-white"
                : "bg-white text-maroon border border-blush hover:bg-blush-soft"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {visible.map((item) => (
          <ProductCard key={item.id} item={item} />
        ))}
      </div>
    </>
  );
}
