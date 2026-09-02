"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setError("Incorrect password");
      setSubmitting(false);
      return;
    }
    router.push(searchParams.get("from") || "/admin/orders");
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-sm px-4 py-24">
      <h1 className="font-display font-bold text-2xl text-maroon text-center">Staff Login</h1>
      <p className="text-sm text-ink/60 text-center mt-2">Chismesito Cafe admin area</p>

      <div className="mt-8 flex flex-col gap-3">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Password"
          autoFocus
          className="w-full rounded-xl border border-blush px-4 py-2.5 text-sm focus:outline-none focus:border-rose"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          onClick={submit}
          disabled={submitting || !password}
          className="rounded-full bg-rose hover:bg-rose-dark disabled:opacity-60 text-white font-semibold px-6 py-3 text-sm transition-colors"
        >
          {submitting ? "Checking..." : "Log In"}
        </button>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
