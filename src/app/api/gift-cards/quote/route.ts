import { NextRequest, NextResponse } from "next/server";
import { priceCartLines, type CartLine } from "@/lib/pricing";
import { describeValue, formatCode, quoteGiftCard } from "@/lib/gift-cards";

/** Checks a gift card code against the cart, so checkout can show what it covers. */
export async function POST(req: NextRequest) {
  const { code, items } = (await req.json()) as { code?: string; items?: CartLine[] };
  if (!code?.trim() || !items?.length) return NextResponse.json({ error: "Enter a gift card code" }, { status: 400 });

  const priced = await priceCartLines(items);
  if (!priced.ok) return NextResponse.json({ error: priced.error }, { status: 400 });

  const quote = await quoteGiftCard(code, priced.orderItemsPayload, priced.totalCents);
  if (!quote.ok) return NextResponse.json({ error: quote.error }, { status: 400 });

  return NextResponse.json({
    code: formatCode(quote.card.code),
    discountCents: quote.discountCents,
    balanceLabel: describeValue(quote.card.kind, quote.card.balance),
  });
}
