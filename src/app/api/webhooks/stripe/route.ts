import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { markOrderPaid } from "@/lib/orders";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    let orderId = session.metadata?.orderId;
    if (!orderId) {
      const { data } = await supabaseAdmin.from("orders").select("id").eq("stripe_session_id", session.id).maybeSingle();
      orderId = data?.id;
    }

    if (orderId) {
      try {
        await markOrderPaid(orderId, session.customer_details?.email);
      } catch {
        return NextResponse.json({ error: "Could not update order" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
