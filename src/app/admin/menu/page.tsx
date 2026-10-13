"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { formatCents } from "@/lib/money";
import { CATEGORY_ORDER, categoriesFor } from "@/lib/menu-categories";
import type { MenuItemFull } from "@/lib/menu";
import { SearchIcon, XIcon } from "@/components/icons";

const ALL = "All";

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItemFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(ALL);
  const [search, setSearch] = useState("");
  // null = closed, "new" = adding a drink, otherwise the item being edited.
  const [editing, setEditing] = useState<MenuItemFull | "new" | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<{ id: string; message: string } | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/menu");
    const data = await res.json();
    setItems(data.items ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const init = async () => load();
    init();
  }, [load]);

  const toggleAvailable = async (item: MenuItemFull) => {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, available: !i.available } : i)));
    await fetch(`/api/admin/menu/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: !item.available }),
    });
  };

  const uploadPhoto = async (item: MenuItemFull, file: File) => {
    setUploadingId(item.id);
    setUploadError(null);
    const form = new FormData();
    form.append("photo", file);
    const res = await fetch(`/api/admin/menu/${item.id}/photo`, { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok) {
      setUploadError({ id: item.id, message: data.error || "Upload failed" });
    } else {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, imageUrl: data.imageUrl } : i)));
    }
    setUploadingId(null);
  };

  const categories = categoriesFor(items);
  const tabs = [ALL, ...categories];
  const query = search.trim().toLowerCase();
  const visible = items
    .filter((i) => tab === ALL || i.category === tab)
    .filter((i) => !query || i.name.toLowerCase().includes(query))
    .sort((a, b) => categories.indexOf(a.category) - categories.indexOf(b.category));

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-4xl text-maroon">Menu</h1>
          <p className="mt-1 text-sm text-ink/60">Manage your drinks, prices and photos.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 rounded-xl bg-white border border-blush px-3 py-2.5 w-full sm:w-56">
            <SearchIcon className="w-4 h-4 text-ink/40 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search drinks..."
              className="w-full text-sm bg-transparent focus:outline-none"
            />
          </label>
          <a
            href="/menu"
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-maroon/30 bg-white text-maroon text-sm font-semibold px-4 py-2.5 hover:bg-cream-alt transition-colors"
          >
            Preview Menu
          </a>
          <button
            onClick={() => setEditing("new")}
            className="rounded-xl bg-rose hover:bg-rose-dark text-white text-sm font-semibold px-4 py-2.5 transition-colors"
          >
            + Add Drink
          </button>
        </div>
      </div>

      <div className="mt-6 flex gap-1 rounded-xl bg-cream-alt/70 p-1 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === t ? "bg-maroon text-cream" : "text-maroon hover:bg-blush-soft"
            }`}
          >
            {t} ({t === ALL ? items.length : items.filter((i) => i.category === t).length})
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-ink/50 py-16">Loading menu...</p>
      ) : visible.length === 0 ? (
        <p className="text-center text-ink/50 py-16">No drinks match your search.</p>
      ) : (
        <div className="mt-5 grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {visible.map((item) => (
            <MenuCard
              key={item.id}
              item={item}
              uploading={uploadingId === item.id}
              uploadError={uploadError?.id === item.id ? uploadError.message : null}
              onToggle={() => toggleAvailable(item)}
              onEdit={() => setEditing(item)}
              onPhoto={(file) => uploadPhoto(item, file)}
            />
          ))}
        </div>
      )}

      {editing && (
        <ItemEditor
          // Remount per item so the form starts from that item's values.
          key={editing === "new" ? "new" : editing.id}
          item={editing === "new" ? null : editing}
          defaultCategory={tab === ALL ? CATEGORY_ORDER[0] : tab}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function MenuCard({
  item,
  uploading,
  uploadError,
  onToggle,
  onEdit,
  onPhoto,
}: {
  item: MenuItemFull;
  uploading: boolean;
  uploadError: string | null;
  onToggle: () => void;
  onEdit: () => void;
  onPhoto: (file: File) => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);

  return (
    <div className={`rounded-2xl bg-white shadow-sm border border-blush/50 p-4 flex flex-col gap-3 ${item.available ? "" : "opacity-70"}`}>
      <div className="flex gap-4">
        <button
          onClick={() => fileInput.current?.click()}
          disabled={uploading}
          title={item.imageUrl ? "Change photo" : "Add photo"}
          className="group relative w-24 h-28 shrink-0 rounded-xl overflow-hidden bg-blush-soft"
        >
          {item.imageUrl && <Image src={item.imageUrl} alt={item.name} fill sizes="96px" className="object-cover" />}
          <span
            className={`absolute inset-0 flex items-center justify-center text-[11px] font-semibold transition-opacity ${
              item.imageUrl ? "bg-maroon/60 text-cream opacity-0 group-hover:opacity-100" : "text-rose"
            }`}
          >
            {uploading ? "Uploading..." : item.imageUrl ? "Change photo" : "+ Add photo"}
          </span>
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onPhoto(file);
            e.target.value = "";
          }}
        />

        <div className="min-w-0 flex-1">
          <p className="font-display font-bold text-maroon leading-snug">{item.name}</p>
          <p className="text-sm font-semibold text-rose">
            {item.hasSizes && item.sizes.length > 1 ? "from " : ""}
            {formatCents(item.startingPriceCents)}
          </p>
          {item.description && <p className="mt-1 text-xs text-ink/55 line-clamp-2">{item.description}</p>}
          <p className="mt-1 text-[11px] text-ink/40">{item.category}</p>
          {uploadError && <p className="mt-1 text-xs text-red-600">{uploadError}</p>}
        </div>
      </div>

      <div className="mt-auto pt-3 border-t border-blush flex items-center justify-between">
        <button onClick={onToggle} className="flex items-center gap-2 text-sm font-medium text-maroon">
          <span
            className={`relative w-10 h-6 rounded-full transition-colors ${item.available ? "bg-rose" : "bg-ink/20"}`}
            aria-hidden
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${item.available ? "left-5" : "left-1"}`}
            />
          </span>
          {item.available ? "Available" : "Sold out"}
        </button>
        <button
          onClick={onEdit}
          className="rounded-lg border border-maroon/30 text-maroon text-sm font-semibold px-4 py-1.5 hover:bg-cream-alt transition-colors"
        >
          Edit
        </button>
      </div>
    </div>
  );
}

const toDollars = (cents: number) => (cents / 100).toFixed(2);
const toCents = (dollars: string) => Math.round(parseFloat(dollars) * 100);

function ItemEditor({
  item,
  defaultCategory,
  onClose,
  onSaved,
}: {
  item: MenuItemFull | null;
  defaultCategory: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isNew = item === null;
  const hasSizes = !!item?.hasSizes && item.sizes.length > 0;

  const [name, setName] = useState(item?.name ?? "");
  const [category, setCategory] = useState(item?.category ?? defaultCategory);
  const [description, setDescription] = useState(item?.description ?? "");
  const [price, setPrice] = useState(item && !hasSizes ? toDollars(item.basePriceCents) : "");
  const [sizePrices, setSizePrices] = useState<Record<string, string>>(
    Object.fromEntries((item?.sizes ?? []).map((s) => [s.id, toDollars(s.priceCents)]))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const save = async () => {
    if (!name.trim()) return setError("Please enter a name.");
    const body: Record<string, unknown> = { name, category, description };
    if (hasSizes) {
      const sizes = item!.sizes.map((s) => ({ id: s.id, priceCents: toCents(sizePrices[s.id]) }));
      if (sizes.some((s) => !(s.priceCents > 0))) return setError("Please enter a valid price for every size.");
      body.sizes = sizes;
    } else {
      const cents = toCents(price);
      if (!(cents > 0)) return setError("Please enter a valid price.");
      body[isNew ? "priceCents" : "basePriceCents"] = cents;
    }

    setSaving(true);
    setError(null);
    const res = await fetch(isNew ? "/api/admin/menu" : `/api/admin/menu/${item.id}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) return setError(data.error || "Could not save");
    onSaved();
  };

  const remove = async () => {
    if (!confirmRemove) return setConfirmRemove(true);
    setSaving(true);
    const res = await fetch(`/api/admin/menu/${item!.id}`, { method: "DELETE" });
    setSaving(false);
    if (!res.ok) return setError("Could not remove item");
    onSaved();
  };

  const input = "w-full rounded-xl border border-blush px-3 py-2 text-sm focus:outline-none focus:border-rose bg-white";
  const label = "block text-xs font-semibold text-maroon mb-1";

  return (
    <div className="fixed inset-0 z-50 bg-ink/40 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div
        className="w-full sm:max-w-md max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white p-6 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-xl text-maroon">{isNew ? "Add Drink" : "Edit Drink"}</h2>
          <button onClick={onClose} aria-label="Close" className="text-ink/40 hover:text-maroon">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div>
          <label className={label}>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Horchata Latte" className={input} />
        </div>
        <div>
          <label className={label}>Section</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={input}>
            {CATEGORY_ORDER.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>
            Description <span className="font-normal text-ink/40">(optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Short description customers will see"
            className={`${input} resize-none`}
          />
        </div>

        {hasSizes ? (
          <div>
            <label className={label}>Prices</label>
            <div className="flex flex-col gap-2">
              {item!.sizes.map((s) => (
                <div key={s.id} className="flex items-center gap-3">
                  <span className="flex-1 text-sm text-maroon">{s.label}</span>
                  <PriceInput
                    value={sizePrices[s.id]}
                    onChange={(v) => setSizePrices((prev) => ({ ...prev, [s.id]: v }))}
                    className={input}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <label className={label}>Price</label>
            <PriceInput value={price} onChange={setPrice} className={input} />
            {isNew && (
              <p className="mt-1 text-[11px] text-ink/40">
                New drinks start with one price. For sizes or add-ons, ask your developer.
              </p>
            )}
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2 pt-1">
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 rounded-xl bg-rose hover:bg-rose-dark disabled:opacity-60 text-white text-sm font-semibold px-4 py-2.5 transition-colors"
          >
            {saving ? "Saving..." : isNew ? "Add Drink" : "Save Changes"}
          </button>
          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-maroon/30 text-maroon text-sm font-semibold px-4 py-2.5 hover:bg-cream-alt transition-colors"
          >
            Cancel
          </button>
        </div>

        {!isNew && (
          <button
            onClick={remove}
            onBlur={() => setConfirmRemove(false)}
            disabled={saving}
            className={`rounded-xl text-sm font-semibold px-4 py-2 transition-colors ${
              confirmRemove ? "bg-red-600 text-white hover:bg-red-700" : "text-red-600 hover:bg-red-50"
            }`}
          >
            {confirmRemove ? "Tap again to remove from menu" : "Remove from menu"}
          </button>
        )}
      </div>
    </div>
  );
}

function PriceInput({ value, onChange, className }: { value: string; onChange: (v: string) => void; className: string }) {
  return (
    <div className="relative w-28">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink/40">$</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} inputMode="decimal" className={`${className} pl-6`} />
    </div>
  );
}
