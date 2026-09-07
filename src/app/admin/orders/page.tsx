"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCents } from "@/lib/money";
import { enableSound, isSoundEnabled, playChime } from "@/lib/notify-sound";

type OrderItem = {
  name_snapshot: string;
  price_cents_snapshot: number;
  quantity: number;
  size_label: string | null;
  modifiers: { group: string; option: string; priceCents: number }[];
  notes: string | null;
};

type Order = {
  id: string;
  created_at: string;
  customer_name: string;
  customer_phone: string | null;
  payment_method: "online" | "pickup";
  payment_status: "pending" | "paid" | "unpaid";
  fulfillment_status: "pending" | "preparing" | "ready" | "completed" | "cancelled";
  total_cents: number;
  staff_notes: string | null;
  items: OrderItem[];
};

const NEXT_STATUS: Record<Order["fulfillment_status"], { label: string; next: Order["fulfillment_status"] } | null> = {
  pending: { label: "Start Preparing", next: "preparing" },
  preparing: { label: "Mark Ready", next: "ready" },
  ready: { label: "Complete", next: "completed" },
  completed: null,
  cancelled: null,
};

const STATUS_STYLES: Record<Order["fulfillment_status"], string> = {
  pending: "bg-amber-100 text-amber-800",
  preparing: "bg-blue-100 text-blue-800",
  ready: "bg-emerald-100 text-emerald-800",
  completed: "bg-ink/10 text-ink/60",
  cancelled: "bg-red-100 text-red-700",
};

// Actionable = a new order staff should notice and start on. Excludes
// online orders still unpaid — nothing to prepare until payment lands.
function needsAttention(order: Order): boolean {
  return order.fulfillment_status === "pending" && (order.payment_method === "pickup" || order.payment_status === "paid");
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState(false);
  const prevAttentionCount = useRef(0);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/orders");
    if (res.ok) {
      const data = await res.json();
      setOrders(data.orders);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  const attentionCount = orders.filter(needsAttention).length;

  // Ding immediately when a new order needing attention shows up, then keep
  // dinging every 30s for as long as at least one is still unclaimed.
  useEffect(() => {
    if (attentionCount > prevAttentionCount.current && isSoundEnabled()) {
      playChime();
    }
    prevAttentionCount.current = attentionCount;
  }, [attentionCount]);

  useEffect(() => {
    const alertInterval = setInterval(() => {
      if (attentionCount > 0 && isSoundEnabled()) {
        playChime();
      }
    }, 30000);
    return () => clearInterval(alertInterval);
  }, [attentionCount]);

  useEffect(() => {
    document.title =
      attentionCount > 0 ? `(${attentionCount}) New Order — Chismesito` : "Chismesito Cafe | Orders";
    return () => {
      document.title = "Chismesito Cafe | Coffee with a little chisme";
    };
  }, [attentionCount]);

  const updateStatus = async (id: string, fulfillmentStatus: Order["fulfillment_status"]) => {
    setUpdating(id);
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fulfillmentStatus }),
    });
    await load();
    setUpdating(null);
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const activeOrders = orders.filter((o) => !["completed", "cancelled"].includes(o.fulfillment_status));
  const pastOrders = orders.filter((o) => ["completed", "cancelled"].includes(o.fulfillment_status));

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl text-maroon">Orders</h1>
          <p className="text-xs text-ink/50">Refreshes automatically every 10s</p>
        </div>
        <div className="flex items-center gap-4">
          {!soundOn && (
            <button
              onClick={() => {
                enableSound();
                setSoundOn(true);
              }}
              className="rounded-full bg-rose text-white text-xs font-semibold px-4 py-2 hover:bg-rose-dark transition-colors"
            >
              🔔 Enable Sound Alerts
            </button>
          )}
          <Link href="/admin/menu" className="text-sm text-ink/50 hover:text-rose underline">
            Menu
          </Link>
          <Link href="/admin/billing" className="text-sm text-ink/50 hover:text-rose underline">
            Billing
          </Link>
          <button
            onClick={logout}
            className="text-sm text-ink/50 hover:text-rose underline"
          >
            Log out
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-ink/50 py-16">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-center text-ink/50 py-16">No orders yet.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {activeOrders.length > 0 && (
            <div className="flex flex-col gap-4">
              {activeOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onAdvance={updateStatus}
                  updating={updating === order.id}
                />
              ))}
            </div>
          )}

          {pastOrders.length > 0 && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-semibold text-maroon">
                Completed / cancelled ({pastOrders.length})
              </summary>
              <div className="flex flex-col gap-4 mt-4">
                {pastOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onAdvance={updateStatus}
                    updating={updating === order.id}
                  />
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

function OrderCard({
  order,
  onAdvance,
  updating,
}: {
  order: Order;
  onAdvance: (id: string, status: Order["fulfillment_status"]) => void;
  updating: boolean;
}) {
  const next = NEXT_STATUS[order.fulfillment_status];
  const needsPaymentAtPickup = order.payment_method === "pickup" && order.payment_status !== "paid";

  const [notes, setNotes] = useState(order.staff_notes ?? "");
  const [savedNotes, setSavedNotes] = useState(order.staff_notes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);

  const saveNotes = async () => {
    setSavingNotes(true);
    await fetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ staffNotes: notes }),
    });
    setSavedNotes(notes);
    setSavingNotes(false);
  };

  return (
    <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
      {needsPaymentAtPickup && (
        <div className="bg-amber-400 text-amber-950 text-center text-sm font-bold py-2 tracking-wide">
          💵 COLLECT PAYMENT AT PICKUP
        </div>
      )}
      <div className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display font-semibold text-maroon">
            {order.customer_name}
            {order.customer_phone && (
              <span className="text-ink/40 font-normal"> · {order.customer_phone}</span>
            )}
          </p>
          <p className="text-xs text-ink/40 font-mono">#{order.id.slice(0, 8)}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className={`text-[10px] font-semibold uppercase tracking-wide rounded-full px-2.5 py-1 ${STATUS_STYLES[order.fulfillment_status]}`}>
            {order.fulfillment_status}
          </span>
          <span
            className={`text-[10px] font-semibold uppercase tracking-wide rounded-full px-2.5 py-1 ${
              order.payment_status === "paid"
                ? "bg-emerald-100 text-emerald-800"
                : order.payment_method === "online"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-ink/10 text-ink/60"
            }`}
          >
            {order.payment_status === "paid"
              ? "Paid Online"
              : order.payment_method === "online"
                ? "Payment Pending"
                : "Pay at Pickup"}
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 border-t border-blush pt-4">
        {order.items.map((item, i) => {
          const summary = [item.size_label, ...item.modifiers.map((m) => m.option)]
            .filter(Boolean)
            .join(", ");
          return (
            <div key={i} className="flex items-start justify-between text-sm gap-3">
              <span className="text-ink/80">
                {item.quantity}&times; {item.name_snapshot}
                {summary && <span className="block text-[11px] text-ink/50">{summary}</span>}
                {item.notes && (
                  <span className="block text-[11px] text-rose font-semibold">📝 {item.notes}</span>
                )}
              </span>
              <span className="text-maroon font-medium shrink-0">
                {formatCents(item.price_cents_snapshot * item.quantity)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 border-t border-blush pt-4">
        <label className="text-xs font-semibold text-ink/50 uppercase tracking-wide">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. no whip, customer running late..."
          rows={2}
          className="mt-1 w-full rounded-xl border border-blush px-3 py-2 text-sm focus:outline-none focus:border-rose resize-none"
        />
        {notes !== savedNotes && (
          <button
            onClick={saveNotes}
            disabled={savingNotes}
            className="mt-2 rounded-full bg-rose hover:bg-rose-dark disabled:opacity-60 text-white text-xs font-semibold px-4 py-2 transition-colors"
          >
            {savingNotes ? "Saving..." : "Save Note"}
          </button>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-blush pt-4">
        <span className="font-semibold text-maroon">{formatCents(order.total_cents)}</span>
        <div className="flex gap-2">
          {order.fulfillment_status === "pending" && (
            <button
              onClick={() => onAdvance(order.id, "cancelled")}
              disabled={updating}
              className="rounded-full border border-ink/20 text-ink/50 text-xs font-semibold px-4 py-2 hover:border-red-300 hover:text-red-600 transition-colors"
            >
              Cancel
            </button>
          )}
          {next && (
            <button
              onClick={() => onAdvance(order.id, next.next)}
              disabled={updating}
              className="rounded-full bg-rose hover:bg-rose-dark disabled:opacity-60 text-white text-xs font-semibold px-4 py-2 transition-colors"
            >
              {updating ? "..." : next.label}
            </button>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
