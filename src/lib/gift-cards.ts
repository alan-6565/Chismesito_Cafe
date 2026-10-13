import "server-only";
import { randomInt } from "crypto";
import { supabaseAdmin } from "./supabase";
import type { PricedOrderItem } from "./pricing";

export type GiftCardKind = "amount" | "drinks";

export type GiftCard = {
  id: string;
  code: string;
  kind: GiftCardKind;
  initial_value: number;
  balance: number;
  recipient_name: string | null;
  recipient_email: string | null;
  note: string | null;
  created_at: string;
  emailed_at: string | null;
};

// Free-drink cards can't be spent on food.
const NON_DRINK_CATEGORIES = ["Pastries", "Snacks"];
// Stripe won't charge less than this, so a card never leaves a smaller remainder.
const STRIPE_MIN_CHARGE_CENTS = 50;
// No 0/O/1/I/L — easy to read off a phone and type at the register.
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 8;

export function normalizeCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/** "K7QM2XPA" → "K7QM-2XPA" */
export function formatCode(code: string): string {
  return `${code.slice(0, 4)}-${code.slice(4)}`;
}

export function describeValue(kind: GiftCardKind, units: number): string {
  return kind === "amount" ? `$${(units / 100).toFixed(2)}` : `${units} free drink${units === 1 ? "" : "s"}`;
}

export async function findGiftCard(code: string): Promise<GiftCard | null> {
  const normalized = normalizeCode(code);
  if (!normalized) return null;
  const { data } = await supabaseAdmin.from("gift_cards").select("*").eq("code", normalized).maybeSingle();
  return data;
}

export async function createGiftCard(input: {
  kind: GiftCardKind;
  value: number;
  recipientName?: string | null;
  recipientEmail?: string | null;
  note?: string | null;
}): Promise<GiftCard | null> {
  // Retry on the (very unlikely) chance a random code is already taken.
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = Array.from({ length: CODE_LENGTH }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]).join("");
    const { data, error } = await supabaseAdmin
      .from("gift_cards")
      .insert({
        code,
        kind: input.kind,
        initial_value: input.value,
        balance: input.value,
        recipient_name: input.recipientName?.trim() || null,
        recipient_email: input.recipientEmail?.trim() || null,
        note: input.note?.trim() || null,
      })
      .select()
      .single();
    if (data) return data;
    if (error?.code !== "23505") {
      console.error("[gift-cards] could not create card:", error);
      return null;
    }
  }
  return null;
}

export type GiftCardQuote =
  | { ok: true; card: GiftCard; discountCents: number; units: number }
  | { ok: false; error: string };

/**
 * Works out how much a card takes off this order without spending anything.
 * Amount cards cover up to their balance; drink cards cover the most
 * expensive drinks first, one per drink left on the card.
 */
export async function quoteGiftCard(
  code: string,
  items: PricedOrderItem[],
  totalCents: number
): Promise<GiftCardQuote> {
  const card = await findGiftCard(code);
  if (!card) return { ok: false, error: "That gift card code wasn't found — check it and try again." };
  if (card.balance <= 0) return { ok: false, error: "That gift card has already been used up." };

  let discountCents: number;
  let units: number;

  if (card.kind === "amount") {
    discountCents = Math.min(card.balance, totalCents);
    units = discountCents;
  } else {
    const { data: menuRows } = await supabaseAdmin
      .from("menu_items")
      .select("id, category")
      .in("id", items.map((i) => i.menu_item_id));
    const categoryById = new Map((menuRows ?? []).map((m) => [m.id, m.category as string]));
    const drinkPrices = items
      .filter((i) => !NON_DRINK_CATEGORIES.includes(categoryById.get(i.menu_item_id) ?? ""))
      .flatMap((i) => Array<number>(i.quantity).fill(i.price_cents_snapshot))
      .sort((a, b) => b - a)
      .slice(0, card.balance);
    if (!drinkPrices.length) {
      return { ok: false, error: "That gift card is for free drinks — add a drink to use it." };
    }
    discountCents = drinkPrices.reduce((sum, p) => sum + p, 0);
    units = drinkPrices.length;
  }

  const remainder = totalCents - discountCents;
  if (remainder > 0 && remainder < STRIPE_MIN_CHARGE_CENTS) {
    discountCents -= STRIPE_MIN_CHARGE_CENTS - remainder;
    if (card.kind === "amount") units = discountCents;
  }
  if (discountCents <= 0) return { ok: false, error: "This order is too small to use that gift card." };

  return { ok: true, card, discountCents, units };
}

/**
 * Takes `units` off a card. Returns false if the balance is no longer there
 * (e.g. the same card was just used somewhere else).
 */
export async function spendGiftCard(
  cardId: string,
  units: number,
  source: "online" | "in_store",
  orderId: string | null = null
): Promise<boolean> {
  const { data, error } = await supabaseAdmin.rpc("adjust_gift_card_balance", { card_id: cardId, delta: -units });
  if (error || data === null) return false;
  await supabaseAdmin.from("gift_card_redemptions").insert({ gift_card_id: cardId, order_id: orderId, amount: units, source });
  return true;
}

/** Gives back what an order took off a card (the order was never paid). */
export async function refundGiftCard(order: { id: string; gift_card_id: string | null; gift_card_units: number }) {
  if (!order.gift_card_id || order.gift_card_units <= 0) return;
  const { data, error } = await supabaseAdmin.rpc("adjust_gift_card_balance", {
    card_id: order.gift_card_id,
    delta: order.gift_card_units,
  });
  if (error || data === null) {
    console.error(`[gift-cards] could not give back balance for order ${order.id}:`, error);
    return;
  }
  await supabaseAdmin
    .from("gift_card_redemptions")
    .insert({ gift_card_id: order.gift_card_id, order_id: order.id, amount: -order.gift_card_units, source: "refund" });
}
