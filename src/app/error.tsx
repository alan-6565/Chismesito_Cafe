"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-24 text-center">
      <span className="text-5xl">☕</span>
      <h1 className="mt-4 font-display font-bold text-3xl text-maroon">Something Went Wrong</h1>
      <p className="mt-2 text-ink/60">
        Sorry about that — something spilled on our end. Please try again.
      </p>
      <button
        onClick={reset}
        className="inline-block mt-8 rounded-full bg-rose hover:bg-rose-dark text-white font-semibold px-6 py-3 text-sm transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
