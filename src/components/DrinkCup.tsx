import { useId } from "react";

// A drawn Chismesito cup, tinted to the drink. Used as the picture for drinks
// that don't have a photo yet, and in the options sheet where it fills up as
// you pick a size (and gets a foam cap / drizzle when you add those).

export type DrinkLook = {
  top: string; // liquid color near the surface
  bottom: string; // liquid color at the bottom (layered look)
  hot: boolean;
  foam?: boolean;
  sprinkle?: string; // topping dots color, if any
};

const has = (s: string, ...words: string[]) => words.some((w) => s.includes(w));

/** Guess a believable color for a drink from its name/category. */
export function lookFor(name: string, category = ""): DrinkLook | null {
  const n = `${name} ${category}`.toLowerCase();
  if (has(n, "pastr", "muffin", "croissant", "pancake", "snack", "chips", "cheetos", "doritos", "paketaxo", "sabritas", "chipotles")) return null;
  const hot = has(n, "(hot)", "hot ", "espresso", "cappuccino", "flat white", "americano", "house coffee") || (category === "Coffee & Hot Drinks" && !has(n, "iced"));
  const pick = (top: string, bottom: string, extra: Partial<DrinkLook> = {}): DrinkLook => ({ top, bottom, hot, ...extra });

  if (has(n, "peppermint")) return pick(has(n, "white") ? "#f1e2d6" : "#8a5a44", "#f6efe9", { sprinkle: "#d42a3a", foam: true });
  if (has(n, "gingerbread")) return pick("#b4743f", "#ecd6bd", { sprinkle: "#7a3e1c" });
  if (has(n, "sugar cookie")) return has(n, "matcha") ? pick("#9cc06a", "#f4ecdf", { sprinkle: "#e46d93" }) : pick("#e7cfae", "#f7ede0", { sprinkle: "#e46d93", foam: true });
  if (has(n, "s'mores", "smores")) return pick("#7b4a32", "#e9d4c0", { foam: true, sprinkle: "#5a3324" });
  if (has(n, "tiramisu")) return pick("#a77455", "#efe0cf", { sprinkle: "#4a2a1c", foam: true });
  if (has(n, "pumpkin")) return has(n, "matcha") ? pick("#9cb85c", "#f1c58c") : pick("#d9893c", "#f3dcc0", { foam: true, sprinkle: "#9a5a22" });
  if (has(n, "dubai")) return pick("#5a3322", "#e45b6c", { sprinkle: "#9cc06a" });
  if (has(n, "strawberry") && has(n, "matcha")) return pick("#8db85a", "#f2a7bd");
  if (has(n, "matcha")) return pick("#8db85a", "#eef0dc");
  if (has(n, "strawberry")) return pick("#f19ab3", "#fbe0e8");
  if (has(n, "ube")) return pick("#9b7bc4", "#ece2f6");
  if (has(n, "mango")) return pick("#f6b73c", "#fde8b8");
  if (has(n, "lemonade")) return pick("#f9e27a", "#fdf6c9");
  if (has(n, "red bull", "refresher")) return pick("#ff7a8a", "#ffc36b");
  if (has(n, "horchata")) return pick("#f3c7c9", "#f7ece0");
  if (has(n, "chai")) return pick("#c7965f", "#f0e0c9", { foam: true });
  if (has(n, "hot chocolate", "mocha", "ferrero", "cocoa", "choco")) return pick("#6b3f2a", "#d8b79c", { foam: true });
  if (has(n, "fruity", "lucky", "cinnamon", "churro", "sponch", "mazapan", "cookie butter", "biscoff", "tres leches", "banana", "caramel", "hazelnut", "vanilla", "frappe"))
    return pick("#caa07a", "#f3e6d6", { foam: true, sprinkle: has(n, "fruity", "lucky") ? "#e46d93" : undefined });
  return pick("#a77455", "#efe0cf");
}

/** How full the cup looks for a size label — bigger cup, more drink. */
export function fillFor(sizeLabel?: string, sizes: string[] = []): number {
  if (!sizeLabel) return 0.78;
  const i = sizes.indexOf(sizeLabel);
  if (i < 0 || sizes.length < 2) return 0.78;
  return 0.52 + (0.4 * i) / (sizes.length - 1);
}

export default function DrinkCup({
  look,
  fill = 0.78,
  drizzle = false,
  foam,
  className = "",
}: {
  look: DrinkLook;
  fill?: number;
  drizzle?: boolean;
  foam?: boolean;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  const showFoam = foam ?? look.foam ?? false;
  // Cup interior runs from y=38 (rim) to y=150 (base)
  const surface = 150 - 108 * Math.max(0.15, Math.min(1, fill));
  const shift = surface - 42; // how far down the liquid group sits

  const cupPath = look.hot ? "M22 38h76l-6 112H28Z" : "M20 38h80l-9 112H29Z";

  return (
    <svg viewBox="0 0 120 170" className={className} role="img" aria-label="Drink illustration">
      <defs>
        <clipPath id={`cup-${id}`}>
          <path d={cupPath} />
        </clipPath>
        <linearGradient id={`liq-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={look.top} />
          <stop offset="1" stopColor={look.bottom} />
        </linearGradient>
        <linearGradient id={`glass-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity=".55" />
          <stop offset=".18" stopColor="#fff" stopOpacity="0" />
          <stop offset=".8" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#fff" stopOpacity=".35" />
        </linearGradient>
      </defs>

      {/* Shadow */}
      <ellipse cx="60" cy="158" rx="34" ry="5" fill="#5f0f26" opacity=".12" />

      {/* Steam (hot) */}
      {look.hot && (
        <g className="steam" fill="none" stroke="#c9a49a" strokeWidth="3" strokeLinecap="round" opacity=".7">
          <path d="M48 20c-5-6 5-8 0-15" />
          <path d="M60 22c-5-6 5-8 0-15" />
          <path d="M72 20c-5-6 5-8 0-15" />
        </g>
      )}

      {/* Straw (iced) */}
      {!look.hot && <rect x="66" y="0" width="7" height="60" rx="3" fill="var(--season-accent, #c41e57)" transform="rotate(12 70 40)" />}

      {/* Cup body (glass) */}
      <path d={cupPath} fill="#fff" fillOpacity=".55" />

      {/* Liquid, clipped to the cup; the whole group slides to the fill level */}
      <g clipPath={`url(#cup-${id})`}>
        <g style={{ transform: `translateY(${shift}px)`, transition: "transform 0.9s cubic-bezier(0.34, 1.3, 0.64, 1)" }}>
          <g className="drink-wave">
            <path d="M-60 42q15-6 30 0t30 0 30 0 30 0 30 0 30 0 30 0 30 0V200H-60Z" fill={`url(#liq-${id})`} />
          </g>
          {showFoam && <path d="M10 38q10-7 20 0t20 0 20 0 20 0 20 0V50q-10 5-20 0t-20 0-20 0-20 0-20 0Z" fill="#fbf4ea" />}
          {look.sprinkle && (
            <g fill={look.sprinkle}>
              <circle cx="40" cy="41" r="1.8" />
              <circle cx="52" cy="38" r="1.5" />
              <circle cx="63" cy="42" r="1.8" />
              <circle cx="75" cy="39" r="1.5" />
              <circle cx="84" cy="42" r="1.4" />
            </g>
          )}
          {/* Ice */}
          {!look.hot && (
            <g fill="#fff" fillOpacity=".45" stroke="#fff" strokeOpacity=".7">
              <rect x="32" y="52" width="16" height="15" rx="3" transform="rotate(-12 40 60)" />
              <rect x="60" y="58" width="15" height="14" rx="3" transform="rotate(10 67 65)" />
              <rect x="44" y="74" width="14" height="13" rx="3" transform="rotate(20 51 80)" />
            </g>
          )}
        </g>
        {/* Drizzle down the inside of the cup */}
        {drizzle && (
          <g fill="none" stroke="#9a5320" strokeWidth="3" strokeLinecap="round" opacity=".75">
            <path d="M30 44c3 14-2 22 2 36" />
            <path d="M88 46c-3 12 2 20-1 34" />
            <path d="M58 44c2 8-2 12 0 20" />
          </g>
        )}
      </g>

      {/* Glass shine + outline */}
      <path d={cupPath} fill={`url(#glass-${id})`} />
      <path d={cupPath} fill="none" stroke="#7e1533" strokeOpacity=".28" strokeWidth="2" strokeLinejoin="round" />

      {/* Lid */}
      {look.hot ? (
        <g>
          <rect x="16" y="30" width="88" height="10" rx="5" fill="#fbf4ea" stroke="#7e1533" strokeOpacity=".25" />
          <path d="M24 30q36-14 72 0" fill="#fbf4ea" stroke="#7e1533" strokeOpacity=".25" />
        </g>
      ) : (
        <g>
          <path d="M16 38q44-30 88 0Z" fill="#fff" fillOpacity=".5" stroke="#7e1533" strokeOpacity=".25" />
          <rect x="14" y="35" width="92" height="6" rx="3" fill="#fff" fillOpacity=".8" stroke="#7e1533" strokeOpacity=".25" />
        </g>
      )}

      {/* Sticker */}
      <circle cx="60" cy="104" r="19" fill="#fff" stroke="#f7d9de" strokeWidth="2" />
      <image href="/images/logo.png" x="43" y="87" width="34" height="34" clipPath="circle(17px at 17px 17px)" preserveAspectRatio="xMidYMid slice" />
    </svg>
  );
}
