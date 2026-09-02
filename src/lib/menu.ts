import "server-only";
import { supabaseAdmin } from "./supabase";

export type ModifierOption = { id: string; label: string; priceCents: number };

export type ModifierGroup = {
  id: string;
  key: string;
  label: string;
  selectionType: "single" | "multi";
  required: boolean;
  maxSelect: number | null;
  options: ModifierOption[];
};

export type MenuItemSize = { id: string; label: string; priceCents: number };

export type MenuItemFull = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string | null;
  badge: string | null;
  available: boolean;
  featured: boolean;
  hasSizes: boolean;
  basePriceCents: number;
  sizes: MenuItemSize[];
  modifierGroups: ModifierGroup[];
  /** Lowest price a customer could pay for this item (smallest size, or base price). */
  startingPriceCents: number;
};

export async function getMenu(): Promise<MenuItemFull[]> {
  const [{ data: items, error: itemsError }, { data: sizes, error: sizesError }, { data: groups, error: groupsError }, { data: options, error: optionsError }, { data: links, error: linksError }] =
    await Promise.all([
      supabaseAdmin
        .from("menu_items")
        .select("id, slug, name, description, category, image_url, badge, available, featured, has_sizes, base_price_cents")
        .order("name"),
      supabaseAdmin.from("menu_item_sizes").select("id, menu_item_id, label, price_cents, sort_order").order("sort_order"),
      supabaseAdmin.from("modifier_groups").select("id, key, label, selection_type, required, max_select"),
      supabaseAdmin.from("modifier_options").select("id, group_id, label, price_cents, sort_order").order("sort_order"),
      supabaseAdmin.from("menu_item_modifier_groups").select("menu_item_id, modifier_group_id"),
    ]);

  const error = itemsError || sizesError || groupsError || optionsError || linksError;
  if (error) throw new Error(`Failed to load menu: ${error.message}`);

  const optionsByGroup = new Map<string, ModifierOption[]>();
  for (const opt of options ?? []) {
    const list = optionsByGroup.get(opt.group_id) ?? [];
    list.push({ id: opt.id, label: opt.label, priceCents: opt.price_cents });
    optionsByGroup.set(opt.group_id, list);
  }

  const groupById = new Map<string, ModifierGroup>();
  for (const g of groups ?? []) {
    groupById.set(g.id, {
      id: g.id,
      key: g.key,
      label: g.label,
      selectionType: g.selection_type,
      required: g.required,
      maxSelect: g.max_select,
      options: optionsByGroup.get(g.id) ?? [],
    });
  }

  const sizesByItem = new Map<string, MenuItemSize[]>();
  for (const s of sizes ?? []) {
    const list = sizesByItem.get(s.menu_item_id) ?? [];
    list.push({ id: s.id, label: s.label, priceCents: s.price_cents });
    sizesByItem.set(s.menu_item_id, list);
  }

  const groupsByItem = new Map<string, ModifierGroup[]>();
  for (const link of links ?? []) {
    const group = groupById.get(link.modifier_group_id);
    if (!group) continue;
    const list = groupsByItem.get(link.menu_item_id) ?? [];
    list.push(group);
    groupsByItem.set(link.menu_item_id, list);
  }

  return (items ?? []).map((item) => {
    const itemSizes = sizesByItem.get(item.id) ?? [];
    const startingPriceCents = item.has_sizes
      ? Math.min(...itemSizes.map((s) => s.priceCents))
      : item.base_price_cents;

    return {
      id: item.id,
      slug: item.slug,
      name: item.name,
      description: item.description,
      category: item.category,
      imageUrl: item.image_url,
      badge: item.badge,
      available: item.available,
      featured: item.featured,
      hasSizes: item.has_sizes,
      basePriceCents: item.base_price_cents,
      sizes: itemSizes,
      modifierGroups: groupsByItem.get(item.id) ?? [],
      startingPriceCents,
    };
  });
}

export const CATEGORY_ORDER = [
  "Hot Drinks",
  "Classic Lattes",
  "Signature Matchas",
  "Iced Signature Lattes",
  "Iced Classics Lattes",
  "Signature Chai",
  "Juice",
  "Specialty",
  "Refreshers and Lemonade",
  "Fall Menu",
  "Snacks",
  "Pastries",
  "Sago",
];
