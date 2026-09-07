"use client";

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

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

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Discard lines from an older cart shape (e.g. pre-modifiers) rather
        // than crashing later on missing fields like `.modifiers`.
        const valid = Array.isArray(parsed)
          ? parsed.filter(
              (i): i is CartItem =>
                i && typeof i.cartLineId === "string" && Array.isArray(i.modifiers) && typeof i.unitPriceCents === "number"
            )
          : [];
        setItems(valid);
      }
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

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
