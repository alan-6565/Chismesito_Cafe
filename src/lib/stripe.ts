import "server-only";
import Stripe from "stripe";

let client: Stripe | undefined;

// Lazily constructed so importing this module never touches
// STRIPE_SECRET_KEY — Next.js evaluates route modules at build time to
// collect their config, and a missing/unavailable key at that point would
// otherwise crash the whole build even though the key is only actually
// needed once a request comes in at runtime.
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    if (!client) {
      if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error("STRIPE_SECRET_KEY is not set");
      }
      client = new Stripe(process.env.STRIPE_SECRET_KEY);
    }
    return Reflect.get(client, prop, client);
  },
});
