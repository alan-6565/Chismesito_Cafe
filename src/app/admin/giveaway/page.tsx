"use client";

import { useEffect, useState } from "react";
import { GIVEAWAY_PRIZES, formatMonth } from "@/lib/giveaway";

type Entry = {
  id: string;
  name: string;
  email: string;
  email_normalized: string;
  phone: string | null;
  source: "order" | "free";
  created_at: string;
  prize: string | null;
  won_at: string | null;
  gift_cards: { code: string } | { code: string }[] | null;
};

type GiveawayData = { month: string; currentMonth: string; months: string[]; entries: Entry[] };

const cardCode = (entry: Entry) => {
  const card = Array.isArray(entry.gift_cards) ? entry.gift_cards[0] : entry.gift_cards;
  return card ? `${card.code.slice(0, 4)}-${card.code.slice(4)}` : null;
};

export default function AdminGiveawayPage() {
  const [month, setMonth] = useState<string | null>(null);
  const [data, setData] = useState<GiveawayData | null>(null);
  const [confirmDraw, setConfirmDraw] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = (m: string | null) =>
    fetch(`/api/admin/giveaway${m ? `?month=${m}` : ""}`)
      .then((res) => res.json())
      .then(setData);

  useEffect(() => {
    load(month);
  }, [month]);

  const draw = async () => {
    if (!data) return;
    setDrawing(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/giveaway/draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month: data.month }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      await load(data.month);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not pick winners");
    } finally {
      setDrawing(false);
      setConfirmDraw(false);
    }
  };

  const winners = data?.entries.filter((e) => e.won_at) ?? [];
  const fromOrders = data?.entries.filter((e) => e.source === "order").length ?? 0;
  const people = new Set(data?.entries.map((e) => e.email_normalized)).size;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl text-maroon">Giveaway</h1>
          <p className="text-xs text-ink/50">
            Every order = 1 entry (up to 1 a day per person) · winners get their prize by email
          </p>
        </div>
        {data && (
          <select
            value={data.month}
            onChange={(e) => {
              setMonth(e.target.value);
              setConfirmDraw(false);
              setError(null);
            }}
            className="rounded-xl border border-blush bg-white px-3 py-2 text-sm text-maroon"
          >
            {data.months.map((m) => (
              <option key={m} value={m}>
                {formatMonth(m)}
              </option>
            ))}
          </select>
        )}
      </div>

      {!data ? (
        <p className="text-center text-ink/50 py-16">Loading...</p>
      ) : (
        <>
          <div className="rounded-2xl bg-maroon text-cream p-6 flex items-center justify-between">
            <div>
              <p className="text-cream/70 text-sm">Entries in {formatMonth(data.month)}</p>
              <p className="font-display font-bold text-3xl mt-1">{data.entries.length}</p>
            </div>
            <div className="text-right text-sm text-cream/70">
              <p>
                {people} {people === 1 ? "person" : "people"}
              </p>
              <p>{fromOrders} from orders</p>
              <p>{data.entries.length - fromOrders} free entries</p>
            </div>
          </div>

          <section className="mt-6 rounded-2xl bg-white shadow-sm p-5">
            <h2 className="font-display font-semibold text-lg text-maroon">Winners</h2>
            {winners.length > 0 ? (
              <div className="mt-3 flex flex-col gap-3">
                {winners.map((w) => (
                  <div key={w.id} className="rounded-xl border border-blush px-4 py-3 flex flex-wrap justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-rose">{w.prize}</p>
                      <p className="font-semibold text-maroon">{w.name}</p>
                      <p className="text-xs text-ink/50">
                        {w.email}
                        {w.phone && ` · ${w.phone}`}
                      </p>
                    </div>
                    {cardCode(w) && (
                      <div className="text-right">
                        <p className="text-xs text-ink/50">Gift card</p>
                        <p className="font-mono font-semibold text-maroon">{cardCode(w)}</p>
                      </div>
                    )}
                  </div>
                ))}
                <p className="text-xs text-ink/50">
                  Their codes were emailed to them, and are listed under Gift Cards.
                </p>
              </div>
            ) : (
              <div className="mt-2">
                <p className="text-sm text-ink/60">
                  Draws {GIVEAWAY_PRIZES.length} entries at random — one for each prize (one win per person) (
                  {GIVEAWAY_PRIZES.map((p) => p.title).join(", ")}) — and emails each their gift card code.
                </p>
                {data.month === data.currentMonth && (
                  <p className="mt-2 text-sm text-amber-700">
                    This month is still running — winners are normally picked on the 1st of next month.
                  </p>
                )}
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                <button
                  onClick={() => (confirmDraw ? draw() : setConfirmDraw(true))}
                  disabled={drawing || people < GIVEAWAY_PRIZES.length}
                  className={`mt-4 rounded-xl font-semibold px-5 py-2.5 text-sm disabled:opacity-40 transition-colors ${
                    confirmDraw ? "bg-rose hover:bg-rose-dark text-white" : "bg-maroon text-cream"
                  }`}
                >
                  {drawing ? "Picking..." : confirmDraw ? "Tap again to pick & email winners" : "Pick Winners"}
                </button>
                {people < GIVEAWAY_PRIZES.length && (
                  <p className="mt-2 text-xs text-ink/50">
                    Needs at least {GIVEAWAY_PRIZES.length} different people entered.
                  </p>
                )}
              </div>
            )}
          </section>

          <h2 className="mt-8 mb-3 font-display font-semibold text-lg text-maroon">Entries</h2>
          {data.entries.length === 0 ? (
            <p className="text-center text-ink/50 py-10">No entries yet this month.</p>
          ) : (
            <div className="rounded-2xl bg-white shadow-sm divide-y divide-blush">
              {data.entries.map((e) => (
                <div key={e.id} className="px-5 py-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <div>
                    <p className="text-ink/80 font-medium">{e.name}</p>
                    <p className="text-xs text-ink/40">
                      {e.email}
                      {e.phone && ` · ${e.phone}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full text-[11px] font-semibold px-2.5 py-0.5 ${
                        e.source === "order" ? "bg-blush-soft text-rose" : "bg-ink/5 text-ink/60"
                      }`}
                    >
                      {e.source === "order" ? "Order" : "Free entry"}
                    </span>
                    <span className="text-xs text-ink/40">
                      {new Date(e.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
