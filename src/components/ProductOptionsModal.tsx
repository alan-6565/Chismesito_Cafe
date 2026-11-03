"use client";

import { useOrderingPause } from "@/lib/use-ordering-pause";
import { useMemo, useState } from "react";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { formatCents } from "@/lib/money";
import type { MenuItemFull } from "@/lib/menu";

export default function ProductOptionsModal({
  item,
  onClose,
}: {
  item: MenuItemFull;
  onClose: () => void;
}) {
  const { addItem } = useCart();
  const { paused } = useOrderingPause();

  const [sizeId, setSizeId] = useState<string | undefined>(item.sizes[0]?.id);
  const [selections, setSelections] = useState<Record<string, Set<string>>>({});
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  const selectedSize = item.sizes.find((s) => s.id === sizeId);

  const missingRequired = item.modifierGroups.filter(
    (g) => g.required && !(selections[g.id]?.size > 0)
  );

  const modifierTotalCents = useMemo(() => {
    let sum = 0;
    for (const group of item.modifierGroups) {
      const chosen = selections[group.id];
      if (!chosen) continue;
      for (const opt of group.options) {
        if (chosen.has(opt.id)) sum += opt.priceCents;
      }
    }
    return sum;
  }, [selections, item.modifierGroups]);

  const unitPriceCents = (selectedSize?.priceCents ?? item.basePriceCents) + modifierTotalCents;
  const totalCents = unitPriceCents * quantity;
  const canAdd = missingRequired.length === 0;

  const toggleOption = (group: MenuItemFull["modifierGroups"][number], optionId: string) => {
    setSelections((prev) => {
      const current = new Set(prev[group.id] ?? []);
      if (group.selectionType === "single") {
        current.clear();
        current.add(optionId);
      } else {
        if (current.has(optionId)) {
          current.delete(optionId);
        } else {
          if (group.maxSelect && current.size >= group.maxSelect) return prev;
          current.add(optionId);
        }
      }
      return { ...prev, [group.id]: current };
    });
  };

  const handleAdd = () => {
    if (!canAdd) return;
    const modifiers = item.modifierGroups.flatMap((group) => {
      const chosen = selections[group.id];
      if (!chosen) return [];
      return group.options
        .filter((opt) => chosen.has(opt.id))
        .map((opt) => ({
          groupId: group.id,
          group: group.label,
          optionId: opt.id,
          option: opt.label,
          priceCents: opt.priceCents,
        }));
    });

    addItem(
      {
        menuItemId: item.slug,
        name: item.name,
        sizeId: selectedSize?.id,
        sizeLabel: selectedSize?.label,
        modifiers,
        unitPriceCents,
        image: item.imageUrl ?? undefined,
        notes: notes.trim() || undefined,
      },
      quantity
    );
    onClose();
  };

  // The mockup shows sizes as cup tiles, one-choice groups (milk) as pills
  // and add-ons as a checklist.
  const cupScale = (i: number) => ["w-4 h-4", "w-5 h-5", "w-6 h-6"][Math.min(i, 2)];
  const sizeHint = (label: string) => label.match(/\d+\s*oz/i)?.[0] ?? "";
  const sizeName = (label: string, i: number, n: number) =>
    /^\d+\s*oz$/i.test(label.trim()) ? (n === 3 ? ["Small", "Medium", "Large"][i] : n === 2 ? ["Regular", "Large"][i] : label) : label.replace(/\(?\d+\s*oz\)?/i, "").trim() || label;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/45 backdrop-blur-[3px]" />
      <div className="relative w-full sm:max-w-4xl max-h-[94dvh] bg-[#fffaf6] rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 text-ink flex items-center justify-center text-2xl leading-none hover:text-berry"
        >
          &times;
        </button>

        <div className="overflow-y-auto grid sm:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] gap-6 p-5 sm:p-7">
          {/* Photo */}
          <div className="relative aspect-[4/3] sm:aspect-[4/5] rounded-3xl overflow-hidden bg-gradient-to-br from-blush-soft to-blush sm:self-start">
            {item.imageUrl ? (
              <Image src={item.imageUrl} alt={item.name} fill sizes="(min-width: 640px) 420px, 100vw" className="object-cover" />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="relative w-40 h-32">
                  <Image src="/images/logo-clear.png" alt="" fill sizes="160px" className="object-contain" />
                </span>
              </span>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col gap-5 min-w-0">
            <div className="pr-10">
              <h2 className="font-bold text-2xl text-ink">{item.name}</h2>
              <p className="mt-1 text-lg font-bold text-berry">{formatCents(unitPriceCents)}</p>
              {item.description && <p className="mt-2 text-sm text-ink/70 leading-relaxed">{item.description}</p>}
            </div>

            {item.sizes.length > 0 && (
              <div>
                <h3 className="font-bold text-ink mb-2">Size</h3>
                <div className="grid grid-cols-3 gap-2.5">
                  {item.sizes.map((size, i) => {
                    const on = sizeId === size.id;
                    const extra = size.priceCents - (item.sizes[0]?.priceCents ?? 0);
                    return (
                      <button
                        key={size.id}
                        type="button"
                        onClick={() => setSizeId(size.id)}
                        aria-pressed={on}
                        className={`rounded-2xl border px-2 py-3 flex flex-col items-center gap-1 transition-colors ${on ? "border-berry bg-blush-soft text-berry" : "border-blush bg-white text-ink hover:border-berry/60"}`}
                      >
                        <svg viewBox="0 0 24 24" className={cupScale(i)} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" aria-hidden>
                          <path d="M6 7h12l-1.3 13H7.3L6 7ZM5 4.5h14V7H5zM9 11h6" />
                        </svg>
                        <span className="text-sm font-semibold leading-none">{sizeName(size.label, i, item.sizes.length)}</span>
                        <span className={`text-xs ${on ? "text-berry/80" : "text-ink/50"}`}>
                          {sizeHint(size.label) || (extra > 0 ? `+${formatCents(extra)}` : "")}
                          {sizeHint(size.label) && extra > 0 ? ` · +${formatCents(extra)}` : ""}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {item.modifierGroups.map((group) => {
              const hint =
                group.selectionType === "single" ? "Pick 1" : group.maxSelect ? `Up to ${group.maxSelect}` : "";
              const missing = group.required && !(selections[group.id]?.size > 0);
              return (
                <div key={group.id}>
                  <div className="mb-2 flex items-baseline justify-between gap-3">
                    <h3 className="font-bold text-ink">{group.label}</h3>
                    <span className={`text-xs ${missing ? "font-semibold text-berry" : "text-ink/50"}`}>
                      {group.required ? "Required" : "Optional"}
                      {hint && ` · ${hint}`}
                    </span>
                  </div>
                  {group.selectionType === "single" ? (
                    <div className="flex flex-wrap gap-2">
                      {group.options.map((opt) => {
                        const on = selections[group.id]?.has(opt.id) ?? false;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => toggleOption(group, opt.id)}
                            aria-pressed={on}
                            className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${on ? "border-berry bg-blush-soft text-berry" : "border-blush bg-white text-ink hover:border-berry/60"}`}
                          >
                            {opt.label}
                            {opt.priceCents > 0 && <span className="font-normal text-ink/50"> +{formatCents(opt.priceCents)}</span>}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col max-h-56 overflow-y-auto pr-1">
                      {group.options.map((opt) => {
                        const on = selections[group.id]?.has(opt.id) ?? false;
                        return (
                          <label key={opt.id} className="flex items-center justify-between gap-3 py-1.5 text-sm cursor-pointer">
                            <span className="flex items-center gap-3">
                              <input type="checkbox" checked={on} onChange={() => toggleOption(group, opt.id)} className="w-[18px] h-[18px] rounded accent-berry" />
                              {opt.label}
                            </span>
                            {opt.priceCents > 0 && <span className="text-ink/70">+{formatCents(opt.priceCents)}</span>}
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            <div>
              <h3 className="font-bold text-ink mb-2">
                Notes <span className="text-ink/40 font-normal text-sm">(optional)</span>
              </h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. extra hot, no ice, allergic to nuts..."
                rows={2}
                maxLength={200}
                className="w-full rounded-2xl border border-blush bg-white px-4 py-2.5 text-sm focus:outline-none focus:border-berry resize-none"
              />
            </div>
          </div>
        </div>

        {/* Quantity + add */}
        <div className="border-t border-blush/70 px-5 sm:px-7 py-4 flex items-center gap-3 sm:gap-4 bg-[#fffaf6]">
          <div className="flex items-center rounded-full border border-blush bg-white shadow-sm">
            <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity" className="w-12 h-12 text-2xl text-ink">
              &minus;
            </button>
            <span className="w-6 text-center text-lg font-semibold">{quantity}</span>
            <button onClick={() => setQuantity((q) => q + 1)} aria-label="Increase quantity" className="w-12 h-12 text-2xl text-ink">
              +
            </button>
          </div>
          <button
            onClick={handleAdd}
            disabled={!canAdd || paused}
            className="flex-1 h-12 rounded-full bg-berry hover:bg-berry-dark disabled:opacity-50 text-white font-semibold text-lg px-6 flex items-center justify-between shadow-lg shadow-berry/25 transition-colors"
          >
            <span className="truncate">{paused ? "Ordering unavailable right now" : canAdd ? "Add to Order" : `Choose ${missingRequired[0]?.label}`}</span>
            <span className="shrink-0 pl-3">{formatCents(totalCents)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
