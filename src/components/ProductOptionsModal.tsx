"use client";

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

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/40" />
      <div className="relative w-full sm:max-w-lg max-h-[90vh] bg-cream rounded-t-3xl sm:rounded-3xl shadow-xl overflow-hidden flex flex-col">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-cream/90 text-maroon flex items-center justify-center text-lg"
        >
          &times;
        </button>

        {item.imageUrl && (
          <div className="relative h-40 shrink-0">
            <Image src={item.imageUrl} alt={item.name} fill sizes="600px" className="object-cover" />
          </div>
        )}

        <div className="overflow-y-auto px-5 py-4 flex flex-col gap-5">
          <div className={item.imageUrl ? undefined : "pr-10"}>
            <h2 className="font-display font-bold text-xl text-maroon">{item.name}</h2>
            {item.description && <p className="text-sm text-ink/60 mt-1">{item.description}</p>}
          </div>

          {item.sizes.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-maroon text-sm">Size</h3>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-white bg-rose rounded-full px-2 py-0.5">
                  Required
                </span>
              </div>
              <div className="flex flex-col rounded-xl border border-blush overflow-hidden">
                {item.sizes.map((size) => (
                  <label
                    key={size.id}
                    className="flex items-center justify-between px-4 py-3 text-sm border-b border-blush last:border-0 bg-white"
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="size"
                        checked={sizeId === size.id}
                        onChange={() => setSizeId(size.id)}
                      />
                      {size.label}
                    </span>
                    <span className="text-ink/60">{formatCents(size.priceCents)}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {item.modifierGroups.map((group) => (
            <div key={group.id}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-maroon text-sm">{group.label}</h3>
                  <p className="text-xs text-ink/50">
                    {group.selectionType === "single"
                      ? "Select 1"
                      : group.maxSelect
                        ? `Select up to ${group.maxSelect}`
                        : "Select at least 1"}
                  </p>
                </div>
                {group.required && (
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-white bg-rose rounded-full px-2 py-0.5 shrink-0">
                    Required
                  </span>
                )}
              </div>
              <div className="flex flex-col rounded-xl border border-blush overflow-hidden max-h-56 overflow-y-auto">
                {group.options.map((opt) => {
                  const checked = selections[group.id]?.has(opt.id) ?? false;
                  return (
                    <label
                      key={opt.id}
                      className="flex items-center justify-between px-4 py-3 text-sm border-b border-blush last:border-0 bg-white"
                    >
                      <span className="flex items-center gap-3">
                        <input
                          type={group.selectionType === "single" ? "radio" : "checkbox"}
                          name={group.id}
                          checked={checked}
                          onChange={() => toggleOption(group, opt.id)}
                        />
                        {opt.label}
                      </span>
                      {opt.priceCents > 0 && (
                        <span className="text-ink/60">+{formatCents(opt.priceCents)}</span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          <div>
            <h3 className="font-semibold text-maroon text-sm mb-2">
              Notes <span className="text-ink/40 font-normal">(optional)</span>
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. extra hot, no ice, allergic to nuts..."
              rows={2}
              maxLength={200}
              className="w-full rounded-xl border border-blush px-3 py-2 text-sm focus:outline-none focus:border-rose resize-none"
            />
          </div>

          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-maroon text-sm">Quantity</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-full border border-blush text-maroon flex items-center justify-center"
              >
                &minus;
              </button>
              <span className="w-5 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 rounded-full border border-blush text-maroon flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-blush">
          <button
            onClick={handleAdd}
            disabled={!canAdd}
            className="w-full rounded-full bg-rose hover:bg-rose-dark disabled:opacity-50 text-white font-semibold px-6 py-3 flex items-center justify-between"
          >
            <span>{canAdd ? "Add to Cart" : `Select ${missingRequired[0]?.label}`}</span>
            <span>{formatCents(totalCents)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
