import "server-only";
import { supabaseAdmin } from "./supabase";

export type CartLine = {
  menuItemId: string; // slug
  sizeId?: string;
  optionIds: string[];
  quantity: number;
};

export type PricedOrderItem = {
  menu_item_id: string;
  name_snapshot: string;
  price_cents_snapshot: number;
  quantity: number;
  size_label: string | null;
  modifiers: { group: string; option: string; priceCents: number }[];
};

export type PricingResult =
  | { ok: true; orderItemsPayload: PricedOrderItem[]; totalCents: number }
  | { ok: false; error: string };

/**
 * Authoritative server-side pricing for a cart. Never trust a client-submitted
 * price — re-derive the total from the current menu_items/menu_item_sizes/
 * modifier_options rows so a tampered or stale client value can't affect what
 * actually gets charged or billed.
 */
export async function priceCartLines(items: CartLine[]): Promise<PricingResult> {
  const slugs = items.map((i) => i.menuItemId);
  const { data: menuItems, error: menuError } = await supabaseAdmin
    .from("menu_items")
    .select("id, slug, name, base_price_cents, has_sizes, available")
    .in("slug", slugs);
  if (menuError || !menuItems) {
    return { ok: false, error: "Could not load menu" };
  }

  const itemIds = menuItems.map((m) => m.id);
  const [{ data: sizes, error: sizesError }, { data: links, error: linksError }] = await Promise.all([
    supabaseAdmin.from("menu_item_sizes").select("id, menu_item_id, label, price_cents").in("menu_item_id", itemIds),
    supabaseAdmin.from("menu_item_modifier_groups").select("menu_item_id, modifier_group_id").in("menu_item_id", itemIds),
  ]);
  if (sizesError || linksError) {
    return { ok: false, error: "Could not load menu options" };
  }

  const allOptionIds = items.flatMap((i) => i.optionIds);
  const { data: options, error: optionsError } = allOptionIds.length
    ? await supabaseAdmin
        .from("modifier_options")
        .select("id, group_id, label, price_cents")
        .in("id", allOptionIds)
    : { data: [] as { id: string; group_id: string; label: string; price_cents: number }[], error: null };
  if (optionsError) {
    return { ok: false, error: "Could not load modifiers" };
  }

  const groupIds = [...new Set((options ?? []).map((o) => o.group_id))];
  const { data: groups, error: groupsError } = groupIds.length
    ? await supabaseAdmin.from("modifier_groups").select("id, label").in("id", groupIds)
    : { data: [] as { id: string; label: string }[], error: null };
  if (groupsError) {
    return { ok: false, error: "Could not load modifier groups" };
  }

  const bySlug = new Map(menuItems.map((m) => [m.slug, m]));
  const sizeById = new Map((sizes ?? []).map((s) => [s.id, s]));
  const optionById = new Map((options ?? []).map((o) => [o.id, o]));
  const groupLabelById = new Map((groups ?? []).map((g) => [g.id, g.label]));
  const allowedGroupsByItem = new Map<string, Set<string>>();
  for (const link of links ?? []) {
    const set = allowedGroupsByItem.get(link.menu_item_id) ?? new Set<string>();
    set.add(link.modifier_group_id);
    allowedGroupsByItem.set(link.menu_item_id, set);
  }

  let totalCents = 0;
  const orderItemsPayload: PricedOrderItem[] = [];

  for (const line of items) {
    const menuItem = bySlug.get(line.menuItemId);
    if (!menuItem || !menuItem.available) {
      return { ok: false, error: `Item no longer available: ${line.menuItemId}` };
    }

    let unitPriceCents = menuItem.base_price_cents;
    let sizeLabel: string | null = null;
    if (menuItem.has_sizes) {
      const size = line.sizeId ? sizeById.get(line.sizeId) : undefined;
      if (!size || size.menu_item_id !== menuItem.id) {
        return { ok: false, error: `Please pick a size for ${menuItem.name}` };
      }
      unitPriceCents = size.price_cents;
      sizeLabel = size.label;
    }

    const allowedGroups = allowedGroupsByItem.get(menuItem.id) ?? new Set<string>();
    const modifiers: { group: string; option: string; priceCents: number }[] = [];
    for (const optionId of line.optionIds) {
      const option = optionById.get(optionId);
      if (!option || !allowedGroups.has(option.group_id)) {
        return { ok: false, error: `Invalid option selected for ${menuItem.name}` };
      }
      unitPriceCents += option.price_cents;
      modifiers.push({
        group: groupLabelById.get(option.group_id) ?? "",
        option: option.label,
        priceCents: option.price_cents,
      });
    }

    totalCents += unitPriceCents * line.quantity;
    orderItemsPayload.push({
      menu_item_id: menuItem.id,
      name_snapshot: menuItem.name,
      price_cents_snapshot: unitPriceCents,
      quantity: line.quantity,
      size_label: sizeLabel,
      modifiers,
    });
  }

  return { ok: true, orderItemsPayload, totalCents };
}
