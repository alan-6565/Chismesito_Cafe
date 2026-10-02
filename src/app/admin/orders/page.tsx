"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { formatCents } from "@/lib/money";
import { formatOrderStamp, formatPickupTime } from "@/lib/hours";
import { enableSound, isSoundEnabled, playChime } from "@/lib/notify-sound";
import { useSetNewOrderCount } from "@/components/admin/AdminShell";
import {
  BagIcon,
  BellIcon,
  CardIcon,
  CashIcon,
  CheckIcon,
  CupIcon,
  NoteIcon,
  ReceiptIcon,
  SearchIcon,
  XIcon,
} from "@/components/icons";

type OrderItem = {
  name_snapshot: string;
  price_cents_snapshot: number;
  quantity: number;
  size_label: string | null;
  modifiers: { group: string; option: string; priceCents: number }[];
  notes: string | null;
  // Joined from menu_items for the thumbnail; null if the drink was deleted.
  menu_items: { image_url: string | null } | { image_url: string | null }[] | null;
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
  pickup_at: string | null; // null = ASAP
  items: OrderItem[];
};

type Status = Order["fulfillment_status"];

const STATUS_UI: Record<Status, { pill: string; pillClass: string; border: string }> = {
  pending: { pill: "New", pillClass: "bg-blush-soft text-rose", border: "border-l-rose" },
  preparing: { pill: "Preparing", pillClass: "bg-amber-100 text-amber-700", border: "border-l-amber-400" },
  ready: { pill: "Ready", pillClass: "bg-emerald-100 text-emerald-700", border: "border-l-emerald-500" },
  completed: { pill: "Completed", pillClass: "bg-ink/10 text-ink/60", border: "border-l-ink/20" },
  cancelled: { pill: "Cancelled", pillClass: "bg-red-100 text-red-700", border: "border-l-red-300" },
};

const TABS = [
  { key: "new", label: "New Orders", statuses: ["pending"] },
  { key: "progress", label: "In Progress", statuses: ["preparing"] },
  { key: "ready", label: "Ready", statuses: ["ready"] },
  { key: "done", label: "Completed", statuses: ["completed", "cancelled"] },
] as const;
type TabKey = (typeof TABS)[number]["key"];

type PaymentFilter = "all" | "online" | "in-person";

const isToday = (iso: string, offsetDays = 0) => {
  const d = new Date(iso);
  const ref = new Date();
  ref.setDate(ref.getDate() - offsetDays);
  return d.toDateString() === ref.toDateString();
};

// Actionable = a new order staff should notice and start on. Excludes
// online orders still unpaid — nothing to prepare until payment lands.
function needsAttention(order: Order): boolean {
  return order.fulfillment_status === "pending" && (order.payment_method === "pickup" || order.payment_status === "paid");
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState(false);
  const [tab, setTab] = useState<TabKey>("new");
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");
  const [now, setNow] = useState(() => Date.now());
  const prevAttentionCount = useRef(0);
  const setNewOrderCount = useSetNewOrderCount();

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/orders");
    if (res.ok) {
      const data = await res.json();
      setOrders(data.orders);
    }
    setNow(Date.now());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  const attentionCount = orders.filter(needsAttention).length;

  useEffect(() => {
    setNewOrderCount(attentionCount);
  }, [attentionCount, setNewOrderCount]);

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

  const countFor = (statuses: readonly Status[]) =>
    orders.filter((o) => statuses.includes(o.fulfillment_status)).length;

  const completedToday = orders.filter((o) => o.fulfillment_status === "completed" && isToday(o.created_at)).length;
  const completedYesterday = orders.filter(
    (o) => o.fulfillment_status === "completed" && isToday(o.created_at, 1)
  ).length;

  const activeTab = TABS.find((t) => t.key === tab)!;
  const query = search.trim().toLowerCase();
  const visible = orders.filter((o) => {
    if (!(activeTab.statuses as readonly Status[]).includes(o.fulfillment_status)) return false;
    if (paymentFilter === "online" && o.payment_method !== "online") return false;
    if (paymentFilter === "in-person" && o.payment_method !== "pickup") return false;
    if (!query) return true;
    return (
      o.customer_name.toLowerCase().includes(query) ||
      (o.customer_phone ?? "").includes(query) ||
      o.id.toLowerCase().startsWith(query.replace(/^#/, "")) ||
      o.items.some((i) => i.name_snapshot.toLowerCase().includes(query))
    );
  });
  // Oldest first while an order still needs work, newest first once done.
  if (tab !== "done") visible.reverse();

  const stats = [
    {
      label: "Pending Orders",
      value: countFor(["pending"]),
      sub: "Awaiting acceptance",
      Icon: ReceiptIcon,
      box: "bg-blush-soft/60 border-blush",
      icon: "bg-blush text-rose",
    },
    {
      label: "Preparing",
      value: countFor(["preparing"]),
      sub: "In progress",
      Icon: CupIcon,
      box: "bg-amber-50 border-amber-100",
      icon: "bg-amber-100 text-amber-700",
    },
    {
      label: "Ready for Pickup",
      value: countFor(["ready"]),
      sub: "Ready at counter",
      Icon: BagIcon,
      box: "bg-emerald-50 border-emerald-100",
      icon: "bg-emerald-100 text-emerald-700",
    },
    {
      label: "Completed Today",
      value: completedToday,
      sub: `${completedYesterday} yesterday`,
      Icon: CheckIcon,
      box: "bg-white border-blush/60",
      icon: "bg-cream-alt text-maroon",
    },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-4xl text-maroon">Orders</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-ink/60">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Auto-refresh every 10s
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {soundOn ? (
            <span className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold px-4 py-2.5">
              <BellIcon className="w-4 h-4" /> Sound Alerts On
            </span>
          ) : (
            <button
              onClick={() => {
                enableSound();
                playChime();
                setSoundOn(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-blush-soft border border-rose/60 text-rose text-sm font-semibold px-4 py-2.5 hover:bg-blush transition-colors"
            >
              <BellIcon className="w-4 h-4" /> Enable Sound Alerts
            </button>
          )}
          <label className="flex items-center gap-2 rounded-xl bg-white border border-blush px-3 py-2.5 w-full sm:w-64">
            <SearchIcon className="w-4 h-4 text-ink/40 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, phone, drink..."
              className="w-full text-sm bg-transparent focus:outline-none"
            />
          </label>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as PaymentFilter)}
            aria-label="Filter by payment"
            className="rounded-xl bg-white border border-blush px-3 py-2.5 text-sm text-maroon font-medium focus:outline-none focus:border-rose"
          >
            <option value="all">All payments</option>
            <option value="online">Paid online</option>
            <option value="in-person">Pay in person</option>
          </select>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(({ label, value, sub, Icon, box, icon }) => (
          <div key={label} className={`rounded-2xl border p-4 flex items-start gap-3 ${box}`}>
            <span className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${icon}`}>
              <Icon className="w-5 h-5" />
            </span>
            <div>
              <p className="text-sm font-medium text-maroon">{label}</p>
              <p className="font-display font-bold text-3xl text-maroon leading-tight">{value}</p>
              <p className="text-xs text-ink/50">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-1 rounded-xl bg-cream-alt/70 p-1 w-full sm:w-fit overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 rounded-lg px-4 sm:px-6 py-2 text-sm font-medium transition-colors ${
              tab === t.key ? "bg-maroon text-cream" : "text-maroon hover:bg-blush-soft"
            }`}
          >
            {t.label} ({countFor(t.statuses)})
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-4">
        {loading ? (
          <p className="text-center text-ink/50 py-16">Loading orders...</p>
        ) : visible.length === 0 ? (
          <p className="text-center text-ink/50 py-16">
            {query || paymentFilter !== "all" ? "No orders match your search." : `No ${activeTab.label.toLowerCase()} right now.`}
          </p>
        ) : (
          visible.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              now={now}
              onAdvance={updateStatus}
              updating={updating === order.id}
            />
          ))
        )}
      </div>
    </div>
  );
}

function timeLabels(iso: string, now: number) {
  const d = new Date(iso);
  const mins = Math.max(0, Math.round((now - d.getTime()) / 60000));
  const ago =
    mins < 1 ? "Just now" : mins < 60 ? `${mins} min ago` : mins < 1440 ? `${Math.floor(mins / 60)} hr ago` : "";
  return { stamp: formatOrderStamp(iso), ago };
}

function PaymentBadge({ order }: { order: Order }) {
  if (order.payment_status === "paid") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold uppercase tracking-wide px-3 py-1">
        <CardIcon className="w-3.5 h-3.5" /> Paid Online
      </span>
    );
  }
  if (order.payment_method === "online") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-ink/5 border border-ink/15 text-ink/60 text-[11px] font-bold uppercase tracking-wide px-3 py-1">
        <CardIcon className="w-3.5 h-3.5" /> Payment Pending
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-[11px] font-bold uppercase tracking-wide px-3 py-1">
      <CashIcon className="w-3.5 h-3.5" /> Pay In Person
    </span>
  );
}

function OrderCard({
  order,
  now,
  onAdvance,
  updating,
}: {
  order: Order;
  now: number;
  onAdvance: (id: string, status: Status) => void;
  updating: boolean;
}) {
  const status = order.fulfillment_status;
  const ui = STATUS_UI[status];
  const isOpen = status !== "completed" && status !== "cancelled";
  const collectAtPickup = order.payment_method === "pickup" && order.payment_status !== "paid" && isOpen;
  const itemCount = order.items.reduce((n, i) => n + i.quantity, 0);
  const { stamp, ago } = timeLabels(order.created_at, now);

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

  const primary = "w-full flex items-center justify-center gap-2 rounded-xl font-semibold text-sm px-4 py-3 disabled:opacity-60 transition-colors";

  return (
    <div className={`rounded-2xl bg-white shadow-sm border border-blush/50 border-l-[6px] ${ui.border}`}>
      <div className="p-5 grid md:grid-cols-[minmax(0,1fr)_200px] gap-5">
        <div className="min-w-0">
          {/* Header row */}
          <div className="flex flex-wrap items-start gap-x-6 gap-y-3">
            <div className="md:pr-6 md:border-r border-blush">
              <div className="flex items-center gap-3">
                <p className="font-display font-bold text-2xl text-maroon">#{order.id.slice(0, 6).toUpperCase()}</p>
                <span className={`rounded-full text-[11px] font-bold uppercase tracking-wide px-3 py-1 ${ui.pillClass}`}>
                  {ui.pill}
                </span>
              </div>
              <p className="text-sm text-ink/60">Ordered {stamp}</p>
              {isOpen && ago && <p className="text-xs text-ink/45">{ago}</p>}
              <p
                className={`mt-1.5 inline-block rounded-full text-[11px] font-bold uppercase tracking-wide px-3 py-1 ${
                  order.pickup_at ? "bg-maroon text-cream" : "bg-cream-alt text-maroon"
                }`}
              >
                Pickup: {order.pickup_at ? formatPickupTime(order.pickup_at, new Date(now)) : "ASAP"}
              </p>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <p className="font-display font-bold text-xl text-maroon">{order.customer_name}</p>
                <PaymentBadge order={order} />
              </div>
              {order.customer_phone && (
                <a href={`tel:${order.customer_phone}`} className="text-sm text-ink/60 hover:text-rose">
                  📞 {order.customer_phone}
                </a>
              )}
            </div>

            <div className="text-right">
              <p className="font-display font-bold text-2xl text-maroon">{formatCents(order.total_cents)}</p>
              <p className="text-sm text-ink/50">
                {itemCount} item{itemCount === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          {collectAtPickup && (
            <div className="mt-4 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 text-sm font-bold px-4 py-2.5 flex items-center gap-2">
              <CashIcon className="w-5 h-5" /> Collect {formatCents(order.total_cents)} at pickup — not paid yet
            </div>
          )}

          {/* Items */}
          <div className="mt-4 pt-4 border-t border-blush flex flex-col gap-3">
            {order.items.map((item, i) => {
              const summary = [item.size_label, ...item.modifiers.map((m) => m.option)].filter(Boolean).join(", ");
              const photo = Array.isArray(item.menu_items) ? item.menu_items[0]?.image_url : item.menu_items?.image_url;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="relative w-14 h-14 shrink-0 rounded-xl overflow-hidden bg-blush-soft">
                    {photo && <Image src={photo} alt="" fill sizes="56px" className="object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-maroon font-medium">
                      {item.quantity} &times; {item.name_snapshot}
                    </p>
                    {summary && <p className="text-xs text-ink/55">{summary}</p>}
                    {item.notes && (
                      <p className="mt-1 inline-flex items-start gap-1.5 rounded-lg bg-blush-soft text-rose text-xs font-semibold px-2.5 py-1.5">
                        <NoteIcon className="w-4 h-4 shrink-0" /> Customer note: {item.notes}
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-medium text-maroon shrink-0">
                    {formatCents(item.price_cents_snapshot * item.quantity)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 md:border-l md:border-blush md:pl-5">
          {status === "pending" && (
            <>
              <button
                onClick={() => onAdvance(order.id, "preparing")}
                disabled={updating}
                className={`${primary} bg-maroon hover:bg-maroon-soft text-cream`}
              >
                <CheckIcon className="w-4 h-4" /> {updating ? "..." : "Accept Order"}
              </button>
              <button
                onClick={() => onAdvance(order.id, "cancelled")}
                disabled={updating}
                className={`${primary} bg-cream-alt text-maroon hover:bg-red-50 hover:text-red-700`}
              >
                <XIcon className="w-4 h-4" /> Cancel Order
              </button>
            </>
          )}
          {status === "preparing" && (
            <button
              onClick={() => onAdvance(order.id, "ready")}
              disabled={updating}
              className={`${primary} bg-blush-soft border border-rose/40 text-rose hover:bg-blush`}
            >
              <BagIcon className="w-4 h-4" /> {updating ? "..." : "Mark as Ready"}
            </button>
          )}
          {status === "ready" && (
            <button
              onClick={() => onAdvance(order.id, "completed")}
              disabled={updating}
              className={`${primary} bg-emerald-600 hover:bg-emerald-700 text-white`}
            >
              <CheckIcon className="w-4 h-4" /> {updating ? "..." : collectAtPickup ? "Paid & Picked Up" : "Picked Up"}
            </button>
          )}

          <div className="mt-auto pt-3">
            <label className="text-xs font-semibold text-maroon">
              Internal Notes <span className="font-normal text-ink/40">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. running late, extra napkins..."
              rows={2}
              className="mt-1 w-full rounded-xl border border-blush px-3 py-2 text-sm focus:outline-none focus:border-rose resize-none"
            />
            {notes !== savedNotes && (
              <button
                onClick={saveNotes}
                disabled={savingNotes}
                className="mt-1 w-full rounded-xl bg-rose hover:bg-rose-dark disabled:opacity-60 text-white text-xs font-semibold px-4 py-2 transition-colors"
              >
                {savingNotes ? "Saving..." : "Save Note"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
