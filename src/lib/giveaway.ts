import type { GiftCardKind } from "./gift-cards";

// One winner per prize, drawn from that month's entries. Change these to
// change what's being given away (each winner gets a gift card for it).
export const GIVEAWAY_PRIZES: { title: string; detail: string; kind: GiftCardKind; value: number }[] = [
  { title: "2 Free Drinks", detail: "Any size, any flavor", kind: "drinks", value: 2 },
  { title: "$15 Digital Gift Card", detail: "Use it online or in the café", kind: "amount", value: 1500 },
];

const TIMEZONE = "America/Los_Angeles";

/** Pacific date ("2026-10-12") of the given instant. */
export function giveawayDay(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE }).format(date);
}

/** Pacific month ("2026-10") of the given instant. */
export function giveawayMonth(date: Date = new Date()): string {
  return giveawayDay(date).slice(0, 7);
}

/** "2026-10" → "October 2026" */
export function formatMonth(month: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${month}-15T12:00:00Z`)
  );
}

/** Last day to enter and the day winners are picked, e.g. "Oct 31, 2026" / "Nov 1, 2026". */
export function giveawayDates(month: string): { endsOn: string; drawnOn: string } {
  const [y, m] = month.split("-").map(Number);
  const fmt = (d: Date) =>
    new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(d);
  return {
    endsOn: fmt(new Date(Date.UTC(y, m, 0, 12))),
    drawnOn: fmt(new Date(Date.UTC(y, m, 1, 12))),
  };
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
