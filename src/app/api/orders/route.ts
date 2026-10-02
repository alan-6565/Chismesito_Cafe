import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { priceCartLines, type CartLine } from "@/lib/pricing";
import { isOpenNow, resolvePickupSlot } from "@/lib/hours";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { notifyStaffOfNewOrder } from "@/lib/staff-notify";

type CartPayload = {
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  // Pacific "YYYY-MM-DDTHH:MM" for order-ahead; omitted means ASAP.
  pickupSlot?: string;
  items: CartLine[];
};

export async function POST(req: NextRequest) {
  const body = (await req.json()) as CartPayload;
  const { customerName, customerPhone, customerEmail, pickupSlot, items } = body;

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

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .insert({
      customer_name: customerName.trim(),
      customer_phone: customerPhone?.trim() || null,
      customer_email: customerEmail?.trim() || null,
      payment_method: "pickup",
      payment_status: "unpaid",
      fulfillment_status: "pending",
      total_cents: priced.totalCents,
      pickup_at: pickupAt,
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

  // Pay-at-pickup orders are confirmed immediately, no payment gate to wait on.
  sendOrderConfirmationEmail(order.id).catch(() => {});
  notifyStaffOfNewOrder(order.id).catch(() => {});

  return NextResponse.json({ orderId: order.id, totalCents: priced.totalCents });
}
