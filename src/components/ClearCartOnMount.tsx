"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart-context";

// The online-checkout cart is only cleared once the customer actually lands
// on a paid confirmation — not before, so canceling out of Stripe leaves
// their order intact instead of forcing a rebuild.
export default function ClearCartOnMount() {
  const { clear } = useCart();

  useEffect(() => {
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
