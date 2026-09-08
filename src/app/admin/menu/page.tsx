"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatCents } from "@/lib/money";
import { CATEGORY_ORDER } from "@/lib/menu-categories";

type AdminMenuItem = {
  id: string;
  name: string;
  category: string;
  imageUrl: string | null;
  available: boolean;
  startingPriceCents: number;
};

export default function AdminMenuPage() {
  const [items, setItems] = useState<AdminMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<{ id: string; message: string } | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState(CATEGORY_ORDER[0]);
  const [newDescription, setNewDescription] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/admin/menu")
      .then((res) => res.json())
      .then((data) => {
        setItems(data.items ?? []);
        setLoading(false);
      });
  }, []);

  useEffect(load, [load]);

  const toggleAvailable = async (item: AdminMenuItem) => {
    setSavingId(item.id);
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, available: !i.available } : i)));
    await fetch(`/api/admin/menu/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: !item.available }),
    });
    setSavingId(null);
  };

  const removeItem = async (item: AdminMenuItem) => {
    if (!window.confirm(`Remove "${item.name}" from the menu? This can't be undone.`)) return;

    setRemovingId(item.id);
    const res = await fetch(`/api/admin/menu/${item.id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    }
    setRemovingId(null);
  };

  const uploadPhoto = async (item: AdminMenuItem, file: File) => {
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

  const addDrink = async () => {
    const priceCents = Math.round(parseFloat(newPrice) * 100);
    if (!newName.trim()) {
      setAddError("Please enter a name.");
      return;
    }
    if (!priceCents || priceCents <= 0) {
      setAddError("Please enter a valid price.");
      return;
    }

    setAdding(true);
    setAddError(null);

    const res = await fetch("/api/admin/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName,
        category: newCategory,
        description: newDescription,
        priceCents,
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      setAddError(data.error || "Could not add item");
    } else {
      setNewName("");
      setNewDescription("");
      setNewPrice("");
      setShowAddForm(false);
      load();
    }
    setAdding(false);
  };

  const categories = CATEGORY_ORDER.filter((c) => items.some((i) => i.category === c));

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl text-maroon">Menu</h1>
          <p className="text-xs text-ink/50">Upload photos and toggle items sold out for today</p>
        </div>
        <Link href="/admin/orders" className="text-sm text-ink/50 hover:text-rose underline">
          Orders
        </Link>
      </div>

      <div className="mb-8">
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="rounded-full bg-rose hover:bg-rose-dark text-white text-sm font-semibold px-5 py-2.5 transition-colors"
          >
            + Add New Drink
          </button>
        ) : (
          <div className="rounded-2xl bg-white shadow-sm p-5 flex flex-col gap-3">
            <h2 className="font-display font-semibold text-maroon">New Drink</h2>
            <div>
              <label className="block text-xs font-medium text-maroon mb-1">Name</label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Pumpkin Spice Latte"
                className="w-full rounded-xl border border-blush px-3 py-2 text-sm focus:outline-none focus:border-rose"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-maroon mb-1">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full rounded-xl border border-blush px-3 py-2 text-sm focus:outline-none focus:border-rose bg-white"
              >
                {CATEGORY_ORDER.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-maroon mb-1">
                Description <span className="text-ink/40">(optional)</span>
              </label>
              <input
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Short description customers will see"
                className="w-full rounded-xl border border-blush px-3 py-2 text-sm focus:outline-none focus:border-rose"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-maroon mb-1">Price ($)</label>
              <input
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="6.00"
                inputMode="decimal"
                className="w-full rounded-xl border border-blush px-3 py-2 text-sm focus:outline-none focus:border-rose"
              />
            </div>
            {addError && <p className="text-xs text-red-600">{addError}</p>}
            <div className="flex gap-2 mt-1">
              <button
                onClick={addDrink}
                disabled={adding}
                className="rounded-full bg-rose hover:bg-rose-dark disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 transition-colors"
              >
                {adding ? "Adding..." : "Add Drink"}
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setAddError(null);
                }}
                disabled={adding}
                className="rounded-full border-2 border-maroon text-maroon text-sm font-semibold px-5 py-2.5 hover:bg-maroon hover:text-cream disabled:opacity-60 transition-colors"
              >
                Cancel
              </button>
            </div>
            <p className="text-[11px] text-ink/40">
              New drinks are added at one flat price with no size options — for sizes or
              add-ons, ask your developer.
            </p>
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-center text-ink/50 py-16">Loading...</p>
      ) : (
        <div className="flex flex-col gap-8">
          {categories.map((category) => (
            <div key={category}>
              <h2 className="font-display font-semibold text-maroon mb-3">{category}</h2>
              <div className="flex flex-col gap-3">
                {items
                  .filter((i) => i.category === category)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl bg-white shadow-sm p-4 flex items-center gap-4"
                    >
                      <div className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden bg-blush">
                        {item.imageUrl && (
                          <Image src={item.imageUrl} alt={item.name} fill sizes="64px" className="object-cover" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-maroon truncate">{item.name}</p>
                        <p className="text-xs text-ink/50">{formatCents(item.startingPriceCents)}</p>
                        {uploadError?.id === item.id && (
                          <p className="text-xs text-red-600 mt-1">{uploadError.message}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <input
                          ref={(el) => {
                            fileInputs.current[item.id] = el;
                          }}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) uploadPhoto(item, file);
                            e.target.value = "";
                          }}
                        />
                        <button
                          onClick={() => fileInputs.current[item.id]?.click()}
                          disabled={uploadingId === item.id}
                          className="rounded-full border-2 border-maroon text-maroon text-xs font-semibold px-4 py-2 hover:bg-maroon hover:text-cream disabled:opacity-60 transition-colors whitespace-nowrap"
                        >
                          {uploadingId === item.id ? "Uploading..." : item.imageUrl ? "Change Photo" : "Add Photo"}
                        </button>

                        <button
                          onClick={() => toggleAvailable(item)}
                          disabled={savingId === item.id}
                          className={`rounded-full text-xs font-semibold px-4 py-2 disabled:opacity-60 transition-colors whitespace-nowrap ${
                            item.available
                              ? "bg-rose hover:bg-rose-dark text-white"
                              : "bg-ink/10 text-ink/60"
                          }`}
                        >
                          {item.available ? "Available" : "Sold Out"}
                        </button>

                        <button
                          onClick={() => removeItem(item)}
                          disabled={removingId === item.id}
                          aria-label={`Remove ${item.name}`}
                          title="Remove from menu"
                          className="rounded-full w-8 h-8 shrink-0 flex items-center justify-center text-ink/40 hover:bg-red-50 hover:text-red-600 disabled:opacity-60 transition-colors text-lg leading-none"
                        >
                          {removingId === item.id ? "…" : "−"}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
