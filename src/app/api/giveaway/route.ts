import { NextRequest, NextResponse } from "next/server";
import { addGiveawayEntry } from "@/lib/orders";
import { isValidEmail } from "@/lib/giveaway";

/** Free entry — no purchase necessary. One free entry per email per month. */
export async function POST(req: NextRequest) {
  const { name, email, phone, agree, website } = (await req.json()) as {
    name?: string;
    email?: string;
    phone?: string;
    agree?: boolean;
    website?: string; // honeypot: hidden from people, bots fill it in
  };

  if (website) return NextResponse.json({ ok: true, alreadyEntered: false });
  if (!name?.trim() || name.trim().length > 80) {
    return NextResponse.json({ error: "Please enter your name" }, { status: 400 });
  }
  if (!email || !isValidEmail(email) || email.length > 200) {
    return NextResponse.json({ error: "Please enter a valid email so we can reach you if you win" }, { status: 400 });
  }
  if (!agree) {
    return NextResponse.json({ error: "Please agree to the official rules" }, { status: 400 });
  }

  const result = await addGiveawayEntry({
    name,
    email,
    phone: phone?.slice(0, 30),
    source: "free",
  });
  if (result === "error") return NextResponse.json({ error: "Something went wrong — please try again" }, { status: 500 });

  return NextResponse.json({ ok: true, alreadyEntered: result === "already-entered" });
}
