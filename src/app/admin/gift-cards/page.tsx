"use client";

import { useEffect, useState } from "react";
import { formatCents } from "@/lib/money";
import QrScanModal from "@/components/admin/QrScanModal";

type Kind = "amount" | "drinks";

type GiftCard = {
  id: string;
  code: string;
  kind: Kind;
  initial_value: number;
  balance: number;
  recipient_name: string | null;
  recipient_email: string | null;
  note: string | null;
  created_at: string;
  emailed_at: string | null;
};

type Redemption = { amount: number; source: "online" | "in_store" | "refund"; created_at: string };

const formatCode = (code: string) => `${code.slice(0, 4)}-${code.slice(4)}`;
const describe = (kind: Kind, units: number) =>
  kind === "amount" ? formatCents(units) : `${units} drink${units === 1 ? "" : "s"}`;
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const inputClass =
  "w-full rounded-xl border border-blush bg-white px-4 py-2.5 text-sm focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/15";

export default function AdminGiftCardsPage() {
  const [cards, setCards] = useState<GiftCard[] | null>(null);

  const reload = () =>
    fetch("/api/admin/gift-cards")
      .then((res) => res.json())
      .then((data) => setCards(data.cards ?? []));

  useEffect(() => {
    reload();
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-maroon">Gift Cards</h1>
        <p className="text-xs text-ink/50">Redeem codes at the register, or create a new gift card to give away</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <RedeemPanel onChange={reload} />
        <CreatePanel onCreated={reload} />
      </div>

      <h2 className="mt-10 mb-3 font-display font-semibold text-lg text-maroon">All gift cards</h2>
      {!cards ? (
        <p className="text-center text-ink/50 py-10">Loading...</p>
      ) : cards.length === 0 ? (
        <p className="text-center text-ink/50 py-10">No gift cards yet.</p>
      ) : (
        <div className="rounded-2xl bg-white shadow-sm divide-y divide-blush">
          {cards.map((card) => (
            <CardRow key={card.id} card={card} />
          ))}
        </div>
      )}
    </div>
  );
}

function RedeemPanel({ onChange }: { onChange: () => void }) {
  const [code, setCode] = useState("");
  const [card, setCard] = useState<GiftCard | null>(null);
  const [history, setHistory] = useState<Redemption[]>([]);
  const [useAmount, setUseAmount] = useState("");
  const [useDrinks, setUseDrinks] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  const lookup = async (codeToFind = code) => {
    if (!codeToFind.trim()) return;
    setBusy(true);
    setError(null);
    setDone(null);
    try {
      const res = await fetch(`/api/admin/gift-cards/lookup?code=${encodeURIComponent(codeToFind)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCard(data.card);
      setHistory(data.history);
      setUseAmount("");
      setUseDrinks(1);
    } catch (err) {
      setCard(null);
      setError(err instanceof Error ? err.message : "Could not look up that code");
    } finally {
      setBusy(false);
    }
  };

  const units = card?.kind === "amount" ? Math.round(parseFloat(useAmount || "0") * 100) : useDrinks;
  const canRedeem = !!card && units > 0 && units <= card.balance;

  const redeem = async () => {
    if (!card || !canRedeem) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/gift-cards/${card.id}/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ units }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDone(`Used ${describe(card.kind, units)} — ${describe(card.kind, data.card.balance)} left on the card.`);
      setCard(null);
      setCode("");
      onChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not redeem");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-2xl bg-white shadow-sm p-5">
      <h2 className="font-display font-semibold text-lg text-maroon">Redeem in café</h2>
      <p className="text-xs text-ink/50 mb-4">Scan the QR code in the customer&apos;s email, or type the code.</p>
      <button
        onClick={() => setScanning(true)}
        className="w-full mb-3 rounded-xl bg-rose hover:bg-rose-dark text-white font-semibold px-4 py-3 text-sm transition-colors"
      >
        Scan QR Code
      </button>
      {scanning && (
        <QrScanModal
          onClose={() => setScanning(false)}
          onScan={(text) => {
            setScanning(false);
            setCode(text);
            lookup(text);
          }}
        />
      )}
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && lookup()}
          placeholder="XXXX-XXXX"
          className={`${inputClass} uppercase font-mono tracking-wider`}
        />
        <button
          onClick={() => lookup()}
          disabled={busy || !code.trim()}
          className="shrink-0 rounded-xl bg-maroon text-cream font-semibold px-4 text-sm disabled:opacity-40"
        >
          Look up
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {done && (
        <p className="mt-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm px-4 py-2.5">
          {done}
        </p>
      )}

      {card && (
        <div className="mt-4 rounded-xl border border-blush p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono font-semibold text-maroon">{formatCode(card.code)}</p>
              <p className="text-xs text-ink/50">{card.recipient_name || "No name"}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-ink/50">Left on card</p>
              <p className="font-display font-bold text-2xl text-maroon">{describe(card.kind, card.balance)}</p>
            </div>
          </div>

          {card.balance === 0 ? (
            <p className="mt-3 text-sm text-ink/60">This card is used up.</p>
          ) : (
            <div className="mt-4 flex items-end gap-2">
              {card.kind === "amount" ? (
                <div className="flex-1">
                  <label className="block text-xs font-medium text-maroon mb-1">Amount to use</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink/40">$</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      value={useAmount}
                      onChange={(e) => setUseAmount(e.target.value)}
                      placeholder={(card.balance / 100).toFixed(2)}
                      className={`${inputClass} pl-7`}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex-1">
                  <label className="block text-xs font-medium text-maroon mb-1">Drinks to use</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setUseDrinks((n) => Math.max(1, n - 1))}
                      className="w-10 h-10 rounded-xl border border-blush text-maroon text-lg"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-semibold text-maroon">{useDrinks}</span>
                    <button
                      onClick={() => setUseDrinks((n) => Math.min(card.balance, n + 1))}
                      className="w-10 h-10 rounded-xl border border-blush text-maroon text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
              <button
                onClick={redeem}
                disabled={busy || !canRedeem}
                className="rounded-xl bg-rose hover:bg-rose-dark text-white font-semibold px-4 py-2.5 text-sm disabled:opacity-40"
              >
                {canRedeem ? `Use ${describe(card.kind, units)}` : "Use"}
              </button>
            </div>
          )}
          {card.kind === "amount" && units > card.balance && (
            <p className="mt-2 text-xs text-red-600">That&apos;s more than what&apos;s left on the card.</p>
          )}

          {history.length > 0 && (
            <div className="mt-4 pt-3 border-t border-blush flex flex-col gap-1">
              {history.map((h, i) => (
                <div key={i} className="flex justify-between text-xs text-ink/50">
                  <span>
                    {h.source === "refund" ? "Given back" : h.source === "online" ? "Used online" : "Used in café"} ·{" "}
                    {formatDate(h.created_at)}
                  </span>
                  <span>
                    {h.amount < 0 ? "+" : "−"}
                    {describe(card.kind, Math.abs(h.amount))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function CreatePanel({ onCreated }: { onCreated: () => void }) {
  const [kind, setKind] = useState<Kind>("amount");
  const [value, setValue] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ card: GiftCard; emailed: boolean } | null>(null);

  const units = kind === "amount" ? Math.round(parseFloat(value || "0") * 100) : parseInt(value || "0", 10);

  const create = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/gift-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, value: units, recipientName: name, recipientEmail: email, note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCreated(data);
      setValue("");
      setName("");
      setEmail("");
      setNote("");
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create gift card");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-2xl bg-white shadow-sm p-5">
      <h2 className="font-display font-semibold text-lg text-maroon">New gift card</h2>
      <p className="text-xs text-ink/50 mb-4">Add an email and the code is sent to them automatically.</p>

      {created && (
        <div className="mb-4 rounded-xl bg-cream-alt/70 border border-blush px-4 py-3 text-center">
          <p className="text-xs text-ink/50">Created</p>
          <p className="font-mono font-bold text-2xl text-maroon tracking-wider">{formatCode(created.card.code)}</p>
          <p className="text-xs text-ink/60">
            {describe(created.card.kind, created.card.initial_value)}
            {created.card.recipient_email &&
              (created.emailed ? ` · emailed to ${created.card.recipient_email}` : " · email could not be sent")}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2">
          {(["amount", "drinks"] as const).map((k) => (
            <button
              key={k}
              onClick={() => {
                setKind(k);
                setValue("");
              }}
              className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                kind === k ? "border-maroon bg-maroon text-cream" : "border-blush text-maroon hover:bg-cream-alt"
              }`}
            >
              {k === "amount" ? "Dollar amount" : "Free drinks"}
            </button>
          ))}
        </div>
        <div>
          <label className="block text-xs font-medium text-maroon mb-1">
            {kind === "amount" ? "Amount" : "Number of drinks (any size)"}
          </label>
          <div className="relative">
            {kind === "amount" && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink/40">$</span>
            )}
            <input
              type="number"
              inputMode={kind === "amount" ? "decimal" : "numeric"}
              min="0"
              step={kind === "amount" ? "0.01" : "1"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={kind === "amount" ? "15.00" : "2"}
              className={`${inputClass} ${kind === "amount" ? "pl-7" : ""}`}
            />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-maroon mb-1">
              Name <span className="text-ink/40 font-normal">(optional)</span>
            </label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-maroon mb-1">
              Email <span className="text-ink/40 font-normal">(optional)</span>
            </label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-maroon mb-1">
            Note <span className="text-ink/40 font-normal">(optional, only you see this)</span>
          </label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Birthday gift"
            className={inputClass}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          onClick={create}
          disabled={busy || !(units > 0)}
          className="rounded-xl bg-rose hover:bg-rose-dark text-white font-semibold px-4 py-2.5 text-sm disabled:opacity-40"
        >
          {busy ? "Creating..." : units > 0 ? `Create ${describe(kind, units)} gift card` : "Create gift card"}
        </button>
      </div>
    </section>
  );
}

function CardRow({ card }: { card: GiftCard }) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const resend = async () => {
    setSending(true);
    const res = await fetch(`/api/admin/gift-cards/${card.id}/email`, { method: "POST" });
    setSending(false);
    setSent(res.ok);
  };

  return (
    <div className={`px-5 py-3.5 flex flex-wrap items-center gap-x-4 gap-y-1 ${card.balance === 0 ? "opacity-50" : ""}`}>
      <p className="font-mono font-semibold text-maroon w-28">{formatCode(card.code)}</p>
      <div className="flex-1 min-w-40 text-sm">
        <p className="text-ink/80">{card.recipient_name || card.recipient_email || "—"}</p>
        <p className="text-xs text-ink/40">
          {formatDate(card.created_at)}
          {card.note && ` · ${card.note}`}
        </p>
      </div>
      <div className="text-right text-sm">
        <p className="font-semibold text-maroon">
          {card.balance === 0 ? "Used up" : `${describe(card.kind, card.balance)} left`}
        </p>
        <p className="text-xs text-ink/40">of {describe(card.kind, card.initial_value)}</p>
      </div>
      {card.recipient_email && (
        <button
          onClick={resend}
          disabled={sending || sent}
          className="text-xs font-semibold text-ink/50 hover:text-rose disabled:opacity-60"
        >
          {sent ? "Sent ✓" : sending ? "Sending..." : "Email again"}
        </button>
      )}
    </div>
  );
}
