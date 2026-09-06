"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCents } from "@/lib/money";

type MonthSummary = {
  month: string;
  itemCount: number;
  orderCount: number;
  amountOwedCents: number;
  paid: boolean;
  paidAt: string | null;
};

type LineItem = { month: string; createdAt: string; name: string; quantity: number };

type BillingData = {
  perItemFeeCents: number;
  totalItemCount: number;
  totalAmountEverOwedCents: number;
  outstandingAmountCents: number;
  months: MonthSummary[];
  lineItems: LineItem[];
};

function formatMonth(month: string) {
  const [year, m] = month.split("-").map(Number);
  return new Date(year, m - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default function AdminBillingPage() {
  const [data, setData] = useState<BillingData | null>(null);
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
  const [updatingMonth, setUpdatingMonth] = useState<string | null>(null);

  const load = () => {
    fetch("/api/admin/billing")
      .then((res) => res.json())
      .then(setData);
  };

  useEffect(load, []);

  const setPaid = async (month: string, paid: boolean) => {
    setUpdatingMonth(month);
    try {
      await fetch("/api/admin/billing", {
        method: paid ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month }),
      });
      load();
    } finally {
      setUpdatingMonth(null);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl text-maroon">Billing</h1>
          <p className="text-xs text-ink/50">
            $1 per item sold through the site (paid online or picked up)
          </p>
        </div>
        <Link href="/admin/orders" className="text-sm text-ink/50 hover:text-rose underline">
          View Orders
        </Link>
      </div>

      {!data ? (
        <p className="text-center text-ink/50 py-16">Loading...</p>
      ) : (
        <>
          <div className="rounded-2xl bg-maroon text-cream p-6 flex items-center justify-between">
            <div>
              <p className="text-cream/70 text-sm">Outstanding balance</p>
              <p className="font-display font-bold text-3xl mt-1">
                {formatCents(data.outstandingAmountCents)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-cream/70 text-sm">Items sold (lifetime)</p>
              <p className="font-display font-bold text-3xl mt-1">{data.totalItemCount}</p>
            </div>
          </div>
          <p className="text-xs text-ink/40 mt-2 text-center">
            {formatCents(data.totalAmountEverOwedCents)} earned lifetime · months marked &ldquo;Paid&rdquo; below are
            excluded from the outstanding balance
          </p>

          {data.months.length === 0 ? (
            <p className="text-center text-ink/50 py-16">
              No paid or completed orders yet — nothing owed so far.
            </p>
          ) : (
            <div className="mt-8 flex flex-col gap-4">
              {data.months.map((m) => {
                const isOpen = expandedMonth === m.month;
                return (
                  <div
                    key={m.month}
                    className={`rounded-2xl bg-white shadow-sm overflow-hidden ${m.paid ? "opacity-60" : ""}`}
                  >
                    <button
                      onClick={() => setExpandedMonth(isOpen ? null : m.month)}
                      className="w-full flex items-center justify-between p-5 text-left"
                    >
                      <div>
                        <p className="font-display font-semibold text-maroon flex items-center gap-2">
                          {formatMonth(m.month)}
                          {m.paid && (
                            <span className="rounded-full bg-green-100 text-green-700 text-[10px] font-semibold px-2 py-0.5">
                              PAID
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-ink/50">
                          {m.itemCount} item{m.itemCount === 1 ? "" : "s"} · {m.orderCount} order
                          {m.orderCount === 1 ? "" : "s"}
                          {m.paid && m.paidAt && ` · settled ${new Date(m.paidAt).toLocaleDateString()}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-maroon">
                          {formatCents(m.amountOwedCents)}
                        </span>
                        <span className="text-ink/40 text-sm">{isOpen ? "▲" : "▼"}</span>
                      </div>
                    </button>

                    {isOpen && (
                      <div className="border-t border-blush px-5 py-4 flex flex-col gap-2">
                        {data.lineItems
                          .filter((li) => li.month === m.month)
                          .map((li, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                              <span className="text-ink/70">
                                {li.quantity}&times; {li.name}
                              </span>
                              <span className="text-ink/40 text-xs">
                                {new Date(li.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                        <div className="pt-2 mt-2 border-t border-blush flex justify-end">
                          <button
                            onClick={() => setPaid(m.month, !m.paid)}
                            disabled={updatingMonth === m.month}
                            className={`rounded-full text-xs font-semibold px-4 py-2 transition-colors disabled:opacity-60 ${
                              m.paid
                                ? "border-2 border-maroon text-maroon hover:bg-maroon hover:text-cream"
                                : "bg-rose hover:bg-rose-dark text-white"
                            }`}
                          >
                            {updatingMonth === m.month
                              ? "Saving..."
                              : m.paid
                                ? "Undo — Mark Unpaid"
                                : "Mark as Paid"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
