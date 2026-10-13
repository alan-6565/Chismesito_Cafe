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
};

type PrizeCard = { code: string; kind: "amount" | "drinks"; initial_value: number; balance: number };

type GiveawayData = {
  month: string;
  currentMonth: string;
  months: string[];
  entries: Entry[];
  prizeCards: PrizeCard[];
};

type Person = { name: string; email: string; phone: string | null; total: number; fromOrders: number };

const formatCode = (code: string) => `${code.slice(0, 4)}-${code.slice(4)}`;
const describe = (card: PrizeCard) =>
  card.kind === "amount" ? `$${(card.initial_value / 100).toFixed(2)}` : `${card.initial_value} free drinks`;

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

  const winner = data?.entries.find((e) => e.won_at);
  const fromOrders = data?.entries.filter((e) => e.source === "order").length ?? 0;
  // One row per person, with how many entries they have this month.
  const people = new Map<string, Person>();
  for (const e of data?.entries ?? []) {
    const person = people.get(e.email_normalized) ?? { name: e.name, email: e.email, phone: e.phone, total: 0, fromOrders: 0 };
    person.total++;
    if (e.source === "order") person.fromOrders++;
    person.phone ??= e.phone;
    people.set(e.email_normalized, person);
  }
  const peopleList = [...people.values()].sort((a, b) => b.total - a.total);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl text-maroon">Giveaway</h1>
          <p className="text-xs text-ink/50">
            1 free entry per person · every online order adds another · the winner gets their prize by email
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
                {people.size} {people.size === 1 ? "person" : "people"}
              </p>
              <p>{fromOrders} from orders</p>
              <p>{data.entries.length - fromOrders} free entries</p>
            </div>
          </div>

          <section className="mt-6 rounded-2xl bg-white shadow-sm p-5">
            <h2 className="font-display font-semibold text-lg text-maroon">Winner</h2>
            {winner ? (
              <div className="mt-3 rounded-xl border border-blush px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-rose">{winner.prize}</p>
                <p className="font-semibold text-maroon">{winner.name}</p>
                <p className="text-xs text-ink/50">
                  {winner.email}
                  {winner.phone && ` · ${winner.phone}`}
                </p>
                {data.prizeCards.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-blush flex flex-col gap-1">
                    {data.prizeCards.map((card) => (
                      <div key={card.code} className="flex justify-between text-sm">
                        <span className="text-ink/60">{describe(card)}</span>
                        <span className="font-mono font-semibold text-maroon">{formatCode(card.code)}</span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="mt-3 text-xs text-ink/50">
                  The codes were emailed to them, and are listed under Gift Cards.
                </p>
              </div>
            ) : (
              <div className="mt-2">
                <p className="text-sm text-ink/60">
                  Draws 1 entry at random — more entries means better odds — and emails that person their prize (
                  {GIVEAWAY_PRIZES.map((p) => p.title).join(" + ")}) as gift card codes.
                </p>
                {data.month === data.currentMonth && (
                  <p className="mt-2 text-sm text-amber-700">
                    This month is still running — the winner is normally picked on the 1st of next month.
                  </p>
                )}
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                <button
                  onClick={() => (confirmDraw ? draw() : setConfirmDraw(true))}
                  disabled={drawing || data.entries.length === 0}
                  className={`mt-4 rounded-xl font-semibold px-5 py-2.5 text-sm disabled:opacity-40 transition-colors ${
                    confirmDraw ? "bg-rose hover:bg-rose-dark text-white" : "bg-maroon text-cream"
                  }`}
                >
                  {drawing ? "Picking..." : confirmDraw ? "Tap again to pick & email the winner" : "Pick Winner"}
                </button>
              </div>
            )}
          </section>

          <h2 className="mt-8 mb-3 font-display font-semibold text-lg text-maroon">Entries</h2>
          {peopleList.length === 0 ? (
            <p className="text-center text-ink/50 py-10">No entries yet this month.</p>
          ) : (
            <div className="rounded-2xl bg-white shadow-sm divide-y divide-blush">
              {peopleList.map((p) => (
                <div key={p.email} className="px-5 py-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <div>
                    <p className="text-ink/80 font-medium">{p.name}</p>
                    <p className="text-xs text-ink/40">
                      {p.email}
                      {p.phone && ` · ${p.phone}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-maroon">
                      {p.total} {p.total === 1 ? "entry" : "entries"}
                    </p>
                    <p className="text-xs text-ink/40">
                      {p.fromOrders} from orders{p.total > p.fromOrders ? " · 1 free" : ""}
                    </p>
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
