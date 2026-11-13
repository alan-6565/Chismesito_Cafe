// Adds the Holiday Menu drinks (prices/sizes copied from the cafe's Toast menu,
// Nov 2026). Each drink exists twice, like the cafe's Toast setup: iced
// (16/20/24 oz) and hot (12/16 oz). Safe to re-run — existing slugs are skipped.
// Run with: npx tsx scripts/add-holiday-menu.ts
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

type Size = { label: string; priceCents: number };
const iced = (a: number, b: number, c: number): Size[] => [
  { label: "16 oz", priceCents: a },
  { label: "20 oz", priceCents: b },
  { label: "24 oz", priceCents: c },
];
const HOT: Size[] = [
  { label: "12 oz", priceCents: 625 },
  { label: "16 oz", priceCents: 725 },
];
const ICED_LATTE = iced(700, 800, 900);
const ICED_CHAI = iced(700, 775, 850);
const ICED_MATCHA = iced(800, 875, 950);

const COFFEE = ["milk_options", "coffee_addons", "caffeine"];
const NON_COFFEE = ["milk_options", "coffee_addons"];

const drinks: { base: string; name: string; description: string; icedSizes: Size[]; groups: string[] }[] = [
  { base: "peppermint-mocha-latte", name: "Peppermint Mocha Latte", description: "Espresso, chocolate, peppermint & milk.", icedSizes: ICED_LATTE, groups: COFFEE },
  { base: "peppermint-white-mocha-latte", name: "Peppermint White Mocha Latte", description: "Espresso, white chocolate, peppermint & milk.", icedSizes: ICED_LATTE, groups: COFFEE },
  { base: "smores-latte", name: "S'mores Latte", description: "Espresso, chocolate, toasted marshmallow & milk.", icedSizes: ICED_LATTE, groups: COFFEE },
  { base: "tiramisu-latte", name: "Tiramisu Latte", description: "Espresso, tiramisu flavor, cocoa & milk.", icedSizes: ICED_LATTE, groups: COFFEE },
  { base: "sugar-cookie-latte", name: "Sugar Cookie Latte", description: "Espresso, sugar cookie flavor & milk.", icedSizes: ICED_LATTE, groups: COFFEE },
  { base: "sugar-cookie-matcha", name: "Sugar Cookie Matcha", description: "Matcha, sugar cookie flavor & milk.", icedSizes: ICED_MATCHA, groups: NON_COFFEE },
  { base: "sugar-cookie-chai", name: "Sugar Cookie Chai", description: "Chai, sugar cookie flavor & milk.", icedSizes: ICED_CHAI, groups: NON_COFFEE },
  { base: "gingerbread-latte", name: "Gingerbread Latte", description: "Espresso, gingerbread & milk.", icedSizes: ICED_LATTE, groups: COFFEE },
  { base: "gingerbread-chai", name: "Gingerbread Chai", description: "Chai, gingerbread & milk.", icedSizes: ICED_CHAI, groups: NON_COFFEE },
];

const rows = drinks.flatMap((d) => [
  { slug: `${d.base}-iced`, name: `${d.name} (Iced)`, description: d.description, sizes: d.icedSizes, groups: d.groups },
  { slug: `${d.base}-hot`, name: `${d.name} (Hot)`, description: d.description, sizes: HOT, groups: d.groups },
]);

async function main() {
  const { data: groups, error: gErr } = await supabase.from("modifier_groups").select("id, key");
  if (gErr) throw gErr;
  const groupId = new Map(groups!.map((g) => [g.key, g.id]));

  const { data: existing, error: eErr } = await supabase.from("menu_items").select("slug").in("slug", rows.map((r) => r.slug));
  if (eErr) throw eErr;
  const have = new Set(existing!.map((e) => e.slug));

  for (const r of rows) {
    if (have.has(r.slug)) {
      console.log("skip (exists):", r.slug);
      continue;
    }
    const { data: item, error } = await supabase
      .from("menu_items")
      .insert({ slug: r.slug, name: r.name, description: r.description, category: "Holiday Menu", has_sizes: true, base_price_cents: 0, available: true })
      .select("id")
      .single();
    if (error || !item) throw new Error(`insert ${r.slug}: ${error?.message}`);

    const { error: sErr } = await supabase
      .from("menu_item_sizes")
      .insert(r.sizes.map((s, i) => ({ menu_item_id: item.id, label: s.label, price_cents: s.priceCents, sort_order: i })));
    if (sErr) throw new Error(`sizes ${r.slug}: ${sErr.message}`);

    const { error: lErr } = await supabase
      .from("menu_item_modifier_groups")
      .insert(r.groups.map((k) => ({ menu_item_id: item.id, modifier_group_id: groupId.get(k)! })));
    if (lErr) throw new Error(`groups ${r.slug}: ${lErr.message}`);

    console.log("added:", r.name, r.sizes.map((s) => `${s.label} $${(s.priceCents / 100).toFixed(2)}`).join(", "));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
