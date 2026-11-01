// The customer covers Stripe's card processing so the café keeps the full
// menu price. Stripe's standard US online card pricing:
const STRIPE_PERCENT = 0.029;
const STRIPE_FIXED_CENTS = 30;

/** Stripe's fee on a charge, rounded to the cent like Stripe does. */
function stripeFee(chargeCents: number): number {
  return Math.round(chargeCents * STRIPE_PERCENT) + STRIPE_FIXED_CENTS;
}

/**
 * The card processing fee to add to an amount so that, after Stripe takes
 * its cut of the whole charge, the café still gets the full amount. Nothing
 * is charged by card (e.g. a gift card covers it all) → no fee.
 */
export function cardFeeFor(amountCents: number): number {
  if (amountCents <= 0) return 0;
  let charge = Math.ceil((amountCents + STRIPE_FIXED_CENTS) / (1 - STRIPE_PERCENT));
  while (charge - stripeFee(charge) < amountCents) charge++;
  return charge - amountCents;
}
