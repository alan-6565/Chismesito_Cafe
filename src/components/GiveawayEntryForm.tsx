"use client";

import { useState } from "react";
import Link from "next/link";

export default function GiveawayEntryForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(false);
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<"entered" | "already" | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/giveaway", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, agree, website }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setResult(data.alreadyEntered ? "already" : "entered");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="rounded-2xl bg-blush-soft/60 border border-blush px-6 py-8 text-center">
        <p className="font-display font-bold text-xl text-maroon">
          {result === "entered" ? "You're entered! 🎉" : "You've already used your free entry this month ♡"}
        </p>
        <p className="mt-1 text-sm text-ink/60">
          Every online order adds another entry. We&apos;ll email you if you win — good luck!
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-blush bg-white px-4 py-3 text-sm focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/15";

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-maroon mb-1">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-maroon mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-maroon mb-1">
          Phone <span className="text-ink/40 font-normal">(optional)</span>
        </label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(510) 555-0123" className={inputClass} />
      </div>
      {/* Honeypot — hidden from people, filled in by bots. */}
      <input
        type="text"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />
      <label className="flex items-start gap-3 text-sm text-ink/70 cursor-pointer">
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-rose"
        />
        <span>
          I agree to the{" "}
          <Link href="/giveaway/rules" className="underline hover:text-rose">
            official rules
          </Link>
          .
        </span>
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-maroon hover:bg-maroon/90 disabled:opacity-60 text-cream font-semibold px-6 py-3.5 text-sm transition-colors"
      >
        {submitting ? "Entering..." : "Enter the Giveaway"}
      </button>
    </form>
  );
}
