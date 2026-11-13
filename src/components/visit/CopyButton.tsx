"use client";

import { useState } from "react";

// Copies text (the address) with a little "Copied ♡" confirmation.
export default function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 1800);
    } catch {
      // clipboard blocked — nothing to do
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${done ? "bg-emerald-100 text-emerald-700" : "bg-blush-soft text-wine hover:bg-blush"}`}
    >
      {done ? "Copied ♡" : label}
    </button>
  );
}
