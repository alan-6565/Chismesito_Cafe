"use client";

import { useEffect, useState } from "react";

const CHOICES = [15, 30, 45, 60];
const clock = (iso: string) => new Date(iso).toLocaleTimeString("en-US", { timeZone: "America/Los_Angeles", hour: "numeric", minute: "2-digit" });

/** Orders page: pause online orders for up to an hour when something goes wrong */
export default function PauseOrdersCard() {
  const [until, setUntil] = useState<string | null>(null);
  const [now, setNow] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = () =>
      fetch("/api/admin/ordering-pause", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => setUntil(d.pausedUntil ?? null))
        .catch(() => {});
    const first = setTimeout(() => {
      load();
      setNow(Date.now());
    }, 0);
    const poll = setInterval(load, 30_000);
    const tick = setInterval(() => setNow(Date.now()), 1_000);
    return () => {
      clearTimeout(first);
      clearInterval(poll);
      clearInterval(tick);
    };
  }, []);

  const set = async (minutes: number) => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/ordering-pause", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ minutes }) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Couldn't save");
      setUntil(d.pausedUntil ?? null);
      setNow(Date.now());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const left = until && now ? Date.parse(until) - now : 0;
  const paused = left > 0;
  const mins = Math.floor(left / 60_000);
  const secs = Math.floor((left % 60_000) / 1000);

  return (
    <div className={`mt-6 rounded-2xl border p-4 sm:p-5 ${paused ? "border-amber-300 bg-amber-50" : "border-blush/60 bg-white"}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className={`font-semibold ${paused ? "text-amber-800" : "text-maroon"}`}>
            {paused ? `⏸ Online orders paused · back at ${clock(until!)}` : "Online orders are on"}
          </p>
          <p className="text-sm text-ink/60">
            {paused
              ? `Turns back on by itself in ${mins}:${String(secs).padStart(2, "0")}. Customers can still see the menu.`
              : "Having a problem? Pause new orders for up to an hour. They turn back on by themselves."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {paused && (
            <button onClick={() => set(0)} disabled={busy} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2.5">
              Resume Orders Now
            </button>
          )}
          <span className="text-sm text-ink/60">{paused ? "Change to:" : "Pause for:"}</span>
          {CHOICES.map((m) => (
            <button
              key={m}
              onClick={() => set(m)}
              disabled={busy}
              className="rounded-xl border border-rose/60 bg-blush-soft hover:bg-blush disabled:opacity-50 text-rose text-sm font-semibold px-3.5 py-2.5"
            >
              {m === 60 ? "1 hr" : `${m} min`}
            </button>
          ))}
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
