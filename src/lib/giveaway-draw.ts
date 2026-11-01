import "server-only";
import { randomInt } from "crypto";
import { supabaseAdmin } from "./supabase";
import { createGiftCard, describeValue, formatCode, type GiftCard } from "./gift-cards";
import { resend, FROM_ADDRESS, sendGiftCardEmail } from "./email";
import { GIVEAWAY_PRIZES, formatMonth, giveawayMonth } from "./giveaway";

export type DrawResult =
  | { ok: true; winner: { name: string; emailed: boolean } }
  | { ok: false; status: number; error: string };

/**
 * Draws one random entry from the month — so each extra entry is an extra
 * chance — gives that person every prize as a gift card by email, and emails
 * the staff inbox who won.
 */
export async function drawGiveawayWinner(month: string): Promise<DrawResult> {
  const { data: entries, error } = await supabaseAdmin
    .from("giveaway_entries")
    .select("id, name, email, email_normalized, phone, won_at")
    .eq("month", month);
  if (error || !entries) return { ok: false, status: 500, error: "Could not load entries" };
  if (entries.some((e) => e.won_at)) return { ok: false, status: 409, error: "A winner was already picked for this month" };
  if (!entries.length) return { ok: false, status: 400, error: "No entries this month" };

  const winner = entries[randomInt(entries.length)];
  const prizeTitle = GIVEAWAY_PRIZES.map((p) => p.title).join(" + ");

  // Claim the win before making any prizes. The one-winner-per-month index
  // rejects a second claim, so a double tap or the timer can't add a winner.
  const { error: claimError } = await supabaseAdmin
    .from("giveaway_entries")
    .update({ prize: prizeTitle, won_at: new Date().toISOString() })
    .eq("id", winner.id)
    .is("won_at", null);
  if (claimError?.code === "23505") return { ok: false, status: 409, error: "A winner was already picked for this month" };
  if (claimError) return { ok: false, status: 500, error: "Could not save the winner" };

  const cards: GiftCard[] = [];
  let emailed = true;
  for (const prize of GIVEAWAY_PRIZES) {
    const card = await createGiftCard({
      kind: prize.kind,
      value: prize.value,
      recipientName: winner.name,
      recipientEmail: winner.email,
      note: `Giveaway winner — ${month}`,
    });
    if (!card) return { ok: false, status: 500, error: "Could not create the prize gift card" };
    cards.push(card);
    emailed = (await sendGiftCardEmail(card, prize.title)) && emailed;
  }

  await supabaseAdmin.from("giveaway_entries").update({ gift_card_id: cards[0].id }).eq("id", winner.id);

  const mine = entries.filter((e) => e.email_normalized === winner.email_normalized);
  await emailStaffWinner({
    month,
    name: winner.name,
    email: winner.email,
    phone: mine.find((e) => e.phone)?.phone ?? null,
    entries: mine.length,
    totalEntries: entries.length,
    prize: prizeTitle,
    cards,
    emailed,
  });

  return { ok: true, winner: { name: winner.name, emailed } };
}

/** The month whose winner is due: last month, if it has entries and no winner yet. */
export async function monthToDraw(): Promise<string | null> {
  const [y, m] = giveawayMonth().split("-").map(Number);
  const previous = m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`;
  const { data } = await supabaseAdmin.from("giveaway_entries").select("won_at").eq("month", previous);
  if (!data?.length || data.some((e) => e.won_at)) return null;
  return previous;
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

async function emailStaffWinner(w: {
  month: string;
  name: string;
  email: string;
  phone: string | null;
  entries: number;
  totalEntries: number;
  prize: string;
  cards: GiftCard[];
  emailed: boolean;
}): Promise<void> {
  const to = process.env.STAFF_EMAIL;
  if (!resend || !to) {
    console.error("[email] giveaway winner email skipped: RESEND_API_KEY or STAFF_EMAIL not set");
    return;
  }

  const row = (label: string, value: string) =>
    `<tr><td style="padding:4px 16px 4px 0;color:#6b4a50;">${label}</td><td style="padding:4px 0;color:#2c1116;">${value}</td></tr>`;
  const codes = w.cards
    .map((c) => row(describeValue(c.kind, c.initial_value), `<strong style="font-family:ui-monospace,monospace;">${formatCode(c.code)}</strong>`))
    .join("");
  const status = w.emailed
    ? "Their prize codes were emailed to them."
    : "<strong>Their prize email didn't go through — please reach out with the codes below.</strong>";

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `🎉 ${formatMonth(w.month)} giveaway winner: ${w.name}`,
    html: `<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:14px;">
      <p><strong>${escapeHtml(w.name)}</strong> won the ${formatMonth(w.month)} giveaway (${w.prize}). ${status}</p>
      <table cellpadding="0" cellspacing="0">
        ${row("Email", escapeHtml(w.email))}
        ${row("Phone", w.phone ? escapeHtml(w.phone) : "Not given")}
        ${row("Entries", `${w.entries} of ${w.totalEntries}`)}
        ${codes}
      </table>
      <p style="color:#6b4a50;">The winner is also on the Giveaway page of your dashboard.</p>
    </div>`,
  });
  if (error) console.error("[email] giveaway winner email failed:", error);
}
