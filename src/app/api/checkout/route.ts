import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { stripe } from "@/lib/stripe";
import { priceCartLines, type CartLine } from "@/lib/pricing";
import { isOpenNow, resolvePickupSlot } from "@/lib/hours";
import { formatCode, quoteGiftCard, spendGiftCard, type GiftCardQuote } from "@/lib/gift-cards";
import { cancelUnpaidOrder, markOrderPaid } from "@/lib/orders";
import { cardFeeFor } from "@/lib/card-fee";

const CHECKOUT_EXPIRY_SECONDS = 30 * 60;

type CartPayload = {
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  // Pacific "YYYY-MM-DDTHH:MM" for order-ahead; omitted means ASAP.
  pickupSlot?: string;
  giftCardCode?: string;
  giveawayOptIn?: boolean;
  items: CartLine[];
};

export async function POST(req: NextRequest) {
  const body = (await req.json()) as CartPayload;
  const { customerName, customerPhone, customerEmail, pickupSlot, giftCardCode, giveawayOptIn, items } = body;

  if (!customerName?.trim() || !items?.length) {
    return NextResponse.json({ error: "Missing name or items" }, { status: 400 });
  }

  let pickupAt: string | null = null;
  if (pickupSlot) {
    pickupAt = resolvePickupSlot(pickupSlot);
    if (!pickupAt) {
      return NextResponse.json({ error: "That pickup time is no longer available — please pick another." }, { status: 400 });
    }
  } else if (!isOpenNow()) {
    return NextResponse.json({ error: "We're closed right now — please choose a pickup time." }, { status: 400 });
  }

  const priced = await priceCartLines(items);
  if (!priced.ok) {
    return NextResponse.json({ error: priced.error }, { status: 400 });
  }

  let giftCard: Extract<GiftCardQuote, { ok: true }> | null = null;
  if (giftCardCode?.trim()) {
    const quote = await quoteGiftCard(giftCardCode, priced.orderItemsPayload, priced.totalCents);
    if (!quote.ok) return NextResponse.json({ error: quote.error }, { status: 400 });
    giftCard = quote;
  }
  const amountDueCents = priced.totalCents - (giftCard?.discountCents ?? 0);
  // Only what's paid by card carries the processing fee.
  const cardFeeCents = cardFeeFor(amountDueCents);

  // Stripe collects an email for paid orders; a card-only order skips Stripe.
  if (giveawayOptIn && amountDueCents === 0 && !customerEmail?.trim()) {
    return NextResponse.json(
      { error: "Add your email so we can reach you if you win the giveaway." },
      { status: 400 }
    );
  }

  // Order is written as "pending" before the customer ever reaches Stripe, so
  // an abandoned checkout never gets counted as a sale — only the webhook,
  // firing on an actual successful payment, flips it to "paid".
  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .insert({
      customer_name: customerName.trim(),
      customer_phone: customerPhone?.trim() || null,
      customer_email: customerEmail?.trim() || null,
      payment_method: "online",
      payment_status: "pending",
      fulfillment_status: "pending",
      total_cents: priced.totalCents,
      card_fee_cents: cardFeeCents,
      pickup_at: pickupAt,
      giveaway_opt_in: !!giveawayOptIn,
      gift_card_id: giftCard?.card.id ?? null,
      gift_card_cents: giftCard?.discountCents ?? 0,
      gift_card_units: giftCard?.units ?? 0,
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

  // Hold the card balance now; it's given back if this checkout is abandoned.
  if (giftCard && !(await spendGiftCard(giftCard.card.id, giftCard.units, "online", order.id))) {
    await supabaseAdmin.from("orders").update({ gift_card_units: 0 }).eq("id", order.id);
    await cancelUnpaidOrder(order.id);
    return NextResponse.json(
      { error: "That gift card's balance just changed — please re-enter it and try again." },
      { status: 409 }
    );
  }

  if (amountDueCents === 0) {
    await markOrderPaid(order.id);
    return NextResponse.json({ url: `/order/confirmation/${order.id}` });
  }

  const origin = new URL(req.url).origin;

  const coupon = giftCard
    ? await stripe.coupons.create({
        amount_off: giftCard.discountCents,
        currency: "usd",
        duration: "once",
        max_redemptions: 1,
        name: `Gift card ${formatCode(giftCard.card.code)}`,
      })
    : null;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: customerEmail?.trim() || undefined,
    line_items: [
      ...priced.orderItemsPayload.map((item) => ({
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
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: cardFeeCents,
          product_data: { name: "Card processing fee" },
        },
      },
    ],
    success_url: `${origin}/order/confirmation/${order.id}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout`,
    ...(coupon ? { discounts: [{ coupon: coupon.id }] } : {}),
    metadata: { orderId: order.id },
    // Stripe's minimum. An abandoned checkout expires quickly so its
    // pending order can be auto-cancelled (see /api/admin/orders).
    expires_at: Math.floor(Date.now() / 1000) + CHECKOUT_EXPIRY_SECONDS,
  });

  await supabaseAdmin.from("orders").update({ stripe_session_id: session.id }).eq("id", order.id);

  return NextResponse.json({ url: session.url });
}
