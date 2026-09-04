import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { stripe } from "@/lib/stripe";
import { priceCartLines, type CartLine } from "@/lib/pricing";

type CartPayload = {
  customerName: string;
  customerPhone?: string;
  items: CartLine[];
};

export async function POST(req: NextRequest) {
  const body = (await req.json()) as CartPayload;
  const { customerName, customerPhone, items } = body;

  if (!customerName?.trim() || !items?.length) {
    return NextResponse.json({ error: "Missing name or items" }, { status: 400 });
  }

  const priced = await priceCartLines(items);
  if (!priced.ok) {
    return NextResponse.json({ error: priced.error }, { status: 400 });
  }

  // Order is written as "pending" before the customer ever reaches Stripe, so
  // an abandoned checkout never gets counted as a sale — only the webhook,
  // firing on an actual successful payment, flips it to "paid".
  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .insert({
      customer_name: customerName.trim(),
      customer_phone: customerPhone?.trim() || null,
      payment_method: "online",
      payment_status: "pending",
      fulfillment_status: "pending",
      total_cents: priced.totalCents,
    })
    .select()
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: "Could not create order" }, { status: 500 });
  }

  const { error: itemsError } = await supabaseAdmin
    .from("order_items")
    .insert(priced.orderItemsPayload.map((i) => ({ ...i, order_id: order.id })));

  if (itemsError) {
    return NextResponse.json({ error: "Could not save order items" }, { status: 500 });
  }

  const origin = new URL(req.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: priced.orderItemsPayload.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: "usd",
        unit_amount: item.price_cents_snapshot,
        product_data: {
          name: item.size_label ? `${item.name_snapshot} (${item.size_label})` : item.name_snapshot,
          description: item.modifiers.map((m) => m.option).join(", ") || undefined,
        },
      },
    })),
    success_url: `${origin}/order/confirmation/${order.id}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout`,
    metadata: { orderId: order.id },
  });

  await supabaseAdmin.from("orders").update({ stripe_session_id: session.id }).eq("id", order.id);

  return NextResponse.json({ url: session.url });
}
