import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

type CartLine = {
  menuItemId: string; // slug
  sizeId?: string;
  optionIds: string[];
  quantity: number;
};

type CartPayload = {
  customerName: string;
  customerPhone?: string;
  items: CartLine[];
};

export async function POST(req: NextRequest) {
  const body = (await req.json()) as CartPayload;
  const { customerName, customerPhone, items } = body;

  if (!customerName?.trim() || !items?.length) {
    return NextResponse.json({ error: "Missing name or items" }, { status: 400 });
  }

  const slugs = items.map((i) => i.menuItemId);
  const { data: menuItems, error: menuError } = await supabaseAdmin
    .from("menu_items")
    .select("id, slug, name, base_price_cents, has_sizes, available")
    .in("slug", slugs);
  if (menuError || !menuItems) {
    return NextResponse.json({ error: "Could not load menu" }, { status: 500 });
  }

  const itemIds = menuItems.map((m) => m.id);
  const [{ data: sizes, error: sizesError }, { data: links, error: linksError }] = await Promise.all([
    supabaseAdmin.from("menu_item_sizes").select("id, menu_item_id, label, price_cents").in("menu_item_id", itemIds),
    supabaseAdmin.from("menu_item_modifier_groups").select("menu_item_id, modifier_group_id").in("menu_item_id", itemIds),
  ]);
  if (sizesError || linksError) {
    return NextResponse.json({ error: "Could not load menu options" }, { status: 500 });
  }

  const allOptionIds = items.flatMap((i) => i.optionIds);
  const { data: options, error: optionsError } = allOptionIds.length
    ? await supabaseAdmin
        .from("modifier_options")
        .select("id, group_id, label, price_cents")
        .in("id", allOptionIds)
    : { data: [] as { id: string; group_id: string; label: string; price_cents: number }[], error: null };
  if (optionsError) {
    return NextResponse.json({ error: "Could not load modifiers" }, { status: 500 });
  }

  const groupIds = [...new Set((options ?? []).map((o) => o.group_id))];
  const { data: groups, error: groupsError } = groupIds.length
    ? await supabaseAdmin.from("modifier_groups").select("id, label").in("id", groupIds)
    : { data: [] as { id: string; label: string }[], error: null };
  if (groupsError) {
    return NextResponse.json({ error: "Could not load modifier groups" }, { status: 500 });
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
  const orderItemsPayload: {
    menu_item_id: string;
    name_snapshot: string;
    price_cents_snapshot: number;
    quantity: number;
    size_label: string | null;
    modifiers: { group: string; option: string; priceCents: number }[];
  }[] = [];

  for (const line of items) {
    const menuItem = bySlug.get(line.menuItemId);
    if (!menuItem || !menuItem.available) {
      return NextResponse.json({ error: `Item no longer available: ${line.menuItemId}` }, { status: 400 });
    }

    let unitPriceCents = menuItem.base_price_cents;
    let sizeLabel: string | null = null;
    if (menuItem.has_sizes) {
      const size = line.sizeId ? sizeById.get(line.sizeId) : undefined;
      if (!size || size.menu_item_id !== menuItem.id) {
        return NextResponse.json({ error: `Please pick a size for ${menuItem.name}` }, { status: 400 });
      }
      unitPriceCents = size.price_cents;
      sizeLabel = size.label;
    }

    const allowedGroups = allowedGroupsByItem.get(menuItem.id) ?? new Set<string>();
    const modifiers: { group: string; option: string; priceCents: number }[] = [];
    for (const optionId of line.optionIds) {
      const option = optionById.get(optionId);
      if (!option || !allowedGroups.has(option.group_id)) {
        return NextResponse.json(
          { error: `Invalid option selected for ${menuItem.name}` },
          { status: 400 }
        );
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

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .insert({
      customer_name: customerName.trim(),
      customer_phone: customerPhone?.trim() || null,
      payment_method: "pickup",
      payment_status: "unpaid",
      fulfillment_status: "pending",
      total_cents: totalCents,
    })
    .select()
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: "Could not create order" }, { status: 500 });
  }

  const { error: itemsError } = await supabaseAdmin
    .from("order_items")
    .insert(orderItemsPayload.map((i) => ({ ...i, order_id: order.id })));

  if (itemsError) {
    return NextResponse.json({ error: "Could not save order items" }, { status: 500 });
  }

  return NextResponse.json({ orderId: order.id, totalCents });
}
