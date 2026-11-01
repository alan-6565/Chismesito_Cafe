"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState, ReactNode } from "react";

export type CartModifier = {
  groupId: string;
  group: string;
  optionId: string;
  option: string;
  priceCents: number;
};

export type CartItem = {
  cartLineId: string;
  menuItemId: string;
  name: string;
  sizeId?: string;
  sizeLabel?: string;
  modifiers: CartModifier[];
  unitPriceCents: number;
  image?: string;
  quantity: number;
  notes?: string;
};

type NewCartLine = Omit<CartItem, "cartLineId" | "quantity">;

type CartContextValue = {
  items: CartItem[];
  addItem: (item: NewCartLine, quantity?: number) => void;
  removeItem: (cartLineId: string) => void;
  updateQuantity: (cartLineId: string, quantity: number) => void;
  clear: () => void;
  totalCents: number;
  totalItems: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "chismesito-cart";
// A cart nobody has touched in this long starts over empty next visit.
const CART_TTL_MS = 60 * 60 * 1000;

// Same menu item + same size + same modifier selections + same note should
// merge into one line (just bump quantity) instead of creating a duplicate
// row. A different note (e.g. "extra hot" vs "no ice") keeps lines separate
// since they're no longer really the same request.
function lineKey(item: NewCartLine): string {
  const mods = [...item.modifiers]
    .map((m) => `${m.group}:${m.option}`)
    .sort()
    .join("|");
  return `${item.menuItemId}::${item.sizeLabel ?? ""}::${mods}::${item.notes ?? ""}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  // The cart as loaded and when it was saved, so just opening the site
  // doesn't restart the hour.
  const loaded = useRef<{ items: CartItem[]; savedAt: number } | null>(null);
  const lastChange = useRef(0);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const saved = JSON.parse(stored) as { items?: unknown; savedAt?: number };
        // Older saves were a bare array with no time, so they count as expired.
        const fresh = typeof saved?.savedAt === "number" && Date.now() - saved.savedAt < CART_TTL_MS;
        const parsed = fresh ? saved.items : [];
        // Discard lines from an older cart shape (e.g. pre-modifiers) rather
        // than crashing later on missing fields like `.modifiers`.
        const valid = Array.isArray(parsed)
          ? parsed.filter(
              (i): i is CartItem =>
                i && typeof i.cartLineId === "string" && Array.isArray(i.modifiers) && typeof i.unitPriceCents === "number"
            )
          : [];
        if (fresh) loaded.current = { items: valid, savedAt: saved.savedAt! };
        setItems(valid);
      }
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const savedAt = loaded.current?.items === items ? loaded.current.savedAt : Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, savedAt }));
    lastChange.current = savedAt;
  }, [items, hydrated]);

  // Phones often bring back an open tab instead of reloading it, so check the
  // cart's age again whenever the page comes back into view.
  useEffect(() => {
    const onShow = () => {
      if (document.visibilityState === "visible" && Date.now() - lastChange.current >= CART_TTL_MS) {
        setItems((prev) => (prev.length ? [] : prev));
      }
    };
    document.addEventListener("visibilitychange", onShow);
    window.addEventListener("pageshow", onShow);
    return () => {
      document.removeEventListener("visibilitychange", onShow);
      window.removeEventListener("pageshow", onShow);
    };
  }, []);

  const addItem: CartContextValue["addItem"] = (item, quantity = 1) => {
    const cartLineId = lineKey(item);
    setItems((prev) => {
      const existing = prev.find((i) => i.cartLineId === cartLineId);
      if (existing) {
        return prev.map((i) =>
          i.cartLineId === cartLineId ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { ...item, cartLineId, quantity }];
    });
    setIsOpen(true);
  };

  const removeItem = (cartLineId: string) => {
    setItems((prev) => prev.filter((i) => i.cartLineId !== cartLineId));
  };

  const updateQuantity = (cartLineId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(cartLineId);
      return;
    }
    setItems((prev) => prev.map((i) => (i.cartLineId === cartLineId ? { ...i, quantity } : i)));
  };

  const clear = () => setItems([]);

  const totalCents = useMemo(
    () => items.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0),
    [items]
  );
  const totalItems = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clear,
        totalCents,
        totalItems,
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}

/** "16 oz, Oat Milk, Extra Espresso Shot" — for cart/checkout line summaries. */
export function summarizeCartLine(item: CartItem): string {
  const parts = [item.sizeLabel, ...item.modifiers.map((m) => m.option)].filter(Boolean);
  return parts.join(", ");
}
