// One-off: adds a "Caffeine" modifier group (Regular / Decaf) and links it to
// every coffee-based drink. Does NOT touch menu_items, sizes, or photos —
// safe to run against the live DB. Idempotent: re-running skips anything
// already inserted. Run with: npx tsx scripts/add-decaf-option.ts

import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

// Coffee-based drinks only — excludes chai, matcha, hot chocolate, juice,
// refreshers/lemonade, and non-coffee Specialty items.
const COFFEE_SLUGS = [
  // Hot Drinks
  "espresso",
  "flat-white",
  "americano",
  "cappuccino",
  "house-coffee",
  "mocha",
  "white-mocha",
  // Classic Lattes
  "banana-bread-latte",
  "caramel-latte",
  "hazelnut-latte",
  "vanilla-latte",
  // Iced Signature Lattes
  "churro-latte",
  "cinnamon-toast-crunch-latte",
  "cocoa-puffs-latte",
  "cookie-butter-latte-biscoff",
  "ferrero-rocher-latte",
  "fruity-pebbles-latte",
  "lucky-charms-latte",
  "mazapan-latte",
  "sponch-latte",
  "tiramisu-latte",
  "tres-leches-latte",
  // Iced Classics Lattes
  "banana-bread-latte-iced",
  "iced-latte",
  // Fall Menu (latte-based only)
  "pumpkin-spice-iced-latte",
  "tres-leches-pumpkin-spice",
  // Specialty
  "caramel-frappe",
];

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }
  const supabase = createClient(url, key);

  let { data: group } = await supabase.from("modifier_groups").select("id").eq("key", "caffeine").maybeSingle();

  if (!group) {
    console.log("Creating Caffeine modifier group...");
    const { data: newGroup, error: groupError } = await supabase
      .from("modifier_groups")
      .insert({ key: "caffeine", label: "Caffeine", selection_type: "single", required: false, max_select: null })
      .select("id")
      .single();
    if (groupError || !newGroup) throw new Error(`Failed to insert caffeine group: ${groupError?.message}`);
    group = newGroup;

    const { error: optionsError } = await supabase.from("modifier_options").insert([
      { group_id: group.id, label: "Regular", price_cents: 0, sort_order: 0 },
      { group_id: group.id, label: "Decaf", price_cents: 0, sort_order: 1 },
    ]);
    if (optionsError) throw new Error(`Failed to insert caffeine options: ${optionsError.message}`);
  } else {
    console.log("Caffeine modifier group already exists, reusing it.");
  }

  const { data: items, error: itemsError } = await supabase
    .from("menu_items")
    .select("id, slug")
    .in("slug", COFFEE_SLUGS);
  if (itemsError) throw new Error(`Failed to load menu items: ${itemsError.message}`);

  const foundSlugs = new Set((items ?? []).map((i) => i.slug));
  const missing = COFFEE_SLUGS.filter((s) => !foundSlugs.has(s));
  if (missing.length) console.warn("Warning — slugs not found in menu_items:", missing);

  const { data: existingLinks } = await supabase
    .from("menu_item_modifier_groups")
    .select("menu_item_id")
    .eq("modifier_group_id", group.id);
  const alreadyLinked = new Set((existingLinks ?? []).map((l) => l.menu_item_id));

  const toLink = (items ?? []).filter((i) => !alreadyLinked.has(i.id));
  if (toLink.length) {
    const { error: linkError } = await supabase
      .from("menu_item_modifier_groups")
      .insert(toLink.map((i) => ({ menu_item_id: i.id, modifier_group_id: group!.id })));
    if (linkError) throw new Error(`Failed to link items: ${linkError.message}`);
  }

  console.log(`Done. Linked Caffeine (Regular/Decaf) to ${toLink.length} items (${alreadyLinked.size} already linked).`);
}

main();
