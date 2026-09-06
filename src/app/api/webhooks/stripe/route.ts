import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { notifyStaffOfNewOrder } from "@/lib/sms";

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
    const orderId = session.metadata?.orderId;
    const stripeEmail = session.customer_details?.email;

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .update({ payment_status: "paid", ...(stripeEmail ? { customer_email: stripeEmail } : {}) })
      .eq(orderId ? "id" : "stripe_session_id", orderId ?? session.id)
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: "Could not update order" }, { status: 500 });
    }

    if (order) {
      sendOrderConfirmationEmail(order.id).catch(() => {});
      notifyStaffOfNewOrder(order.id).catch(() => {});
    }
  }

  return NextResponse.json({ received: true });
}
