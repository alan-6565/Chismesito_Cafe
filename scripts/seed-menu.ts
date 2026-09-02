// Seeds the real Chismesito Cafe menu (from Toast) into Supabase: items,
// sizes, shared modifier groups/options, and which groups apply to which
// item. Run with: npm run seed:menu
//
// This does a full wipe-and-reseed of the catalog tables (menu_items,
// menu_item_sizes, modifier_groups, modifier_options,
// menu_item_modifier_groups). Safe pre-launch: order_items.menu_item_id is
// ON DELETE SET NULL, so historical test orders keep their name/price
// snapshot even though the menu_item row they pointed at gets replaced.
//
// NOTE on prices: sizes for items where Toast's modal wasn't fully visible
// in the screenshots were reconstructed by pattern-matching against items
// where the full size ladder WAS visible (e.g. Matcha Latte, Red Bull
// Refresher, Pumpkin Spice Chai). A few items (Caramel Frappe, Strawberry
// Lemonade, Strawberry Horchata, Mini Pancakes) had no visible price at all
// in the screenshots and are rough placeholders — flagged below, worth
// double-checking against Toast directly.

import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

type ModifierGroupDef = {
  key: string;
  label: string;
  selectionType: "single" | "multi";
  required: boolean;
  maxSelect?: number;
  options: { label: string; priceCents: number }[];
};

const MODIFIER_GROUPS: ModifierGroupDef[] = [
  {
    key: "milk_options",
    label: "Milk Options",
    selectionType: "multi",
    required: true,
    options: [
      { label: "Whole Milk", priceCents: 0 },
      { label: "Almond Milk", priceCents: 75 },
      { label: "Oat Milk", priceCents: 75 },
      { label: "2%", priceCents: 0 },
    ],
  },
  {
    key: "hot_or_iced",
    label: "Hot or Iced",
    selectionType: "single",
    required: true,
    options: [
      { label: "Hot", priceCents: 0 },
      { label: "Iced", priceCents: 0 },
    ],
  },
  {
    key: "coffee_addons",
    label: "Coffee Add-Ons",
    selectionType: "multi",
    required: false,
    maxSelect: 10,
    options: [
      { label: "Extra Syrup Pump", priceCents: 50 },
      { label: "Extra Espresso Shot", priceCents: 100 },
      { label: "Extra Drizzle - Lechera", priceCents: 75 },
      { label: "Extra Drizzle - Caramel", priceCents: 75 },
      { label: "Extra Drizzle - Dulce de Leche", priceCents: 75 },
      { label: "Extra Drizzle - Chocolate", priceCents: 75 },
      { label: "Pumpkin Cold Foam", priceCents: 50 },
    ],
  },
  {
    key: "refresher_flavor",
    label: "Flavor Selection",
    selectionType: "single",
    required: true,
    options: [
      "Pink Paradise (Strawberry + Peach)",
      "Blue Lagoon (Blue Raspberry + Coconut)",
      "Sour Patch (Sour Candy + Green Apple)",
      "Shirley Temple (Cherry + Lime)",
      "Tropical Punch (Mango + Pineapple)",
      "Island Breeze (Guava + Coconut)",
      "Sunset Refresher (Peach + Mango)",
      "Dragon Wave (Dragon Fruit + Mango)",
      "Citrus Storm (Orange + Lime)",
      "Watermelon Rush (Watermelon + Strawberry)",
      "Strawberry",
      "Mango",
      "Peach",
      "Guava",
      "Raspberry",
      "Cherry",
      "Passionfruit",
      "Green Apple",
      "Pomegranate",
      "Blackberry",
      "Pineapple",
      "Kiwi",
      "Orange",
      "Coconut",
      "Watermelon",
      "White Peach",
      "Lime",
      "Blue Raspberry",
      "Sour Candy",
      "Grapefruit",
    ].map((label) => ({ label, priceCents: 0 })),
  },
  {
    key: "refresher_addons",
    label: "Add-Ons",
    selectionType: "multi",
    required: false,
    maxSelect: 3,
    options: [
      { label: "Creamy + Whipped Cream", priceCents: 100 },
      { label: "Blended", priceCents: 100 },
      { label: "Popping Boba", priceCents: 100 },
    ],
  },
];

type Size = { label: string; priceCents: number };

type ItemDef = {
  slug: string;
  name: string;
  description?: string;
  category: string;
  featured?: boolean;
  groups?: string[];
} & ({ basePriceCents: number; sizes?: undefined } | { sizes: Size[]; basePriceCents?: undefined });

// 16oz base, then standard +$1.00 / +$2.00 ladder — used for items where
// Toast's exact size modal wasn't captured, extrapolated from items where it
// was (Matcha Latte, Red Bull Refresher, Pumpkin Spice Chai all follow this
// ~+$1/+$1-2 pattern).
const stdSizes = (base16: number): Size[] => [
  { label: "16 oz", priceCents: base16 },
  { label: "20 oz", priceCents: base16 + 100 },
  { label: "24 oz", priceCents: base16 + 200 },
];

// Hot Drinks + Classic Lattes are actually just 2 sizes, confirmed via two
// real modals: Mocha (12oz $6.50 -> 16oz $7.00) and Hazelnut Latte (12oz
// $6.25 -> 16oz $6.75) — both a flat +$0.50 step, no 3rd tier.
const twoTierSizes = (base12: number): Size[] => [
  { label: "12 oz", priceCents: base12 },
  { label: "16 oz", priceCents: base12 + 50 },
];

const HOT_DRINK_GROUPS = ["milk_options", "coffee_addons"];
const CLASSIC_LATTE_GROUPS = ["milk_options", "hot_or_iced", "coffee_addons"];
const MATCHA_GROUPS = ["milk_options", "coffee_addons"];
const REFRESHER_GROUPS = ["refresher_flavor", "refresher_addons"];

const ITEMS: ItemDef[] = [
  // Hot Drinks — Espresso and Flat White have no size; everything else is
  // 12oz/16oz (confirmed via the Mocha modal)
  { slug: "espresso", name: "Espresso", category: "Hot Drinks", basePriceCents: 325 },
  // Flat White's real price wasn't confirmed anywhere — placeholder, please correct
  { slug: "flat-white", name: "Flat White", category: "Hot Drinks", basePriceCents: 450 },
  { slug: "americano", name: "Americano", category: "Hot Drinks", sizes: twoTierSizes(475), groups: HOT_DRINK_GROUPS },
  { slug: "hot-chai-latte", name: "Hot Chai Latte", category: "Hot Drinks", sizes: twoTierSizes(600), groups: HOT_DRINK_GROUPS },
  { slug: "house-coffee", name: "House Coffee", category: "Hot Drinks", sizes: twoTierSizes(400), groups: HOT_DRINK_GROUPS },
  { slug: "hot-chocolate", name: "Hot Chocolate", category: "Hot Drinks", sizes: twoTierSizes(600), groups: HOT_DRINK_GROUPS },
  { slug: "mocha", name: "Mocha", category: "Hot Drinks", sizes: [{ label: "12 oz", priceCents: 650 }, { label: "16 oz", priceCents: 700 }], groups: HOT_DRINK_GROUPS },
  { slug: "white-mocha", name: "White Mocha", category: "Hot Drinks", sizes: twoTierSizes(650), groups: HOT_DRINK_GROUPS },

  // Classic Lattes — 12oz/16oz only (confirmed via Hazelnut Latte modal)
  { slug: "banana-bread-latte", name: "Banana Bread Latte", category: "Classic Lattes", sizes: twoTierSizes(625), groups: CLASSIC_LATTE_GROUPS },
  { slug: "caramel-latte", name: "Caramel Latte", category: "Classic Lattes", sizes: twoTierSizes(625), groups: CLASSIC_LATTE_GROUPS },
  { slug: "hazelnut-latte", name: "Hazelnut Latte", category: "Classic Lattes", sizes: [{ label: "12 oz", priceCents: 625 }, { label: "16 oz", priceCents: 675 }], groups: CLASSIC_LATTE_GROUPS, featured: true },
  { slug: "vanilla-latte", name: "Vanilla Latte", category: "Classic Lattes", sizes: twoTierSizes(625), groups: CLASSIC_LATTE_GROUPS },

  // Signature Matchas
  { slug: "matcha-latte", name: "Matcha Latte", category: "Signature Matchas", sizes: [{ label: "16 oz", priceCents: 725 }, { label: "20 oz", priceCents: 825 }, { label: "24 oz", priceCents: 900 }], groups: MATCHA_GROUPS },
  { slug: "vanilla-matcha-latte", name: "Vanilla Matcha Latte", category: "Signature Matchas", sizes: [{ label: "16 oz", priceCents: 750 }, { label: "20 oz", priceCents: 825 }, { label: "24 oz", priceCents: 925 }], groups: MATCHA_GROUPS },
  { slug: "banana-bread-matcha-latte", name: "Banana Bread Matcha Latte", category: "Signature Matchas", sizes: stdSizes(800), groups: MATCHA_GROUPS },
  { slug: "cookie-butter-matcha-latte", name: "Cookie Butter Matcha Latte", category: "Signature Matchas", sizes: stdSizes(800), groups: MATCHA_GROUPS, featured: true },
  { slug: "mazapan-matcha-latte", name: "Mazapan Matcha Latte", category: "Signature Matchas", sizes: stdSizes(800), groups: MATCHA_GROUPS, featured: true },
  { slug: "strawberry-matcha-latte", name: "Strawberry Matcha Latte", category: "Signature Matchas", sizes: stdSizes(800), groups: MATCHA_GROUPS, featured: true },
  { slug: "tres-leches-matcha", name: "Tres Leches Matcha", category: "Signature Matchas", sizes: stdSizes(800), groups: MATCHA_GROUPS },

  // Iced Signature Lattes — flat-priced, all include vanilla cold foam
  ...[
    ["choco-mazapan-latte", "Choco Mazapan Latte"],
    ["churro-latte", "Churro Latte"],
    ["cinnamon-toast-crunch-latte", "Cinnamon Toast Crunch Latte"],
    ["cocoa-puffs-latte", "Cocoa Puffs Latte"],
    ["cookie-butter-latte-biscoff", "Cookie Butter Latte (Biscoff)"],
    ["fruity-pebbles-latte", "Fruity Pebbles"],
    ["mazapan-latte", "Mazapan Latte"],
    ["tres-leches-latte", "Tres Leches Latte"],
    ["ferrero-rocher-latte", "Ferrero Rocher"],
    ["lucky-charms-latte", "Lucky Charms"],
    ["tiramisu-latte", "Tiramisu"],
    ["sponch-latte", "Sponch"],
  ].map(
    ([slug, name]): ItemDef => ({
      slug,
      name,
      description: "Includes vanilla cold foam.",
      category: "Iced Signature Lattes",
      sizes: stdSizes(700), // confirmed via Tiramisu modal: 16/20/24 = $7/$8/$9
      groups: HOT_DRINK_GROUPS,
      featured: name === "Tres Leches Latte",
    })
  ),

  // Iced Classics Lattes — same 3-size (16/20/24) pattern as Iced Signature Lattes
  { slug: "iced-latte", name: "Iced Latte", category: "Iced Classics Lattes", sizes: stdSizes(625), groups: HOT_DRINK_GROUPS },
  { slug: "banana-bread-latte-iced", name: "Banana Bread Latte Iced", category: "Iced Classics Lattes", sizes: stdSizes(675), groups: HOT_DRINK_GROUPS },

  // Signature Chai
  { slug: "banana-bread-chai", name: "Banana Bread Chai", category: "Signature Chai", sizes: stdSizes(700), groups: HOT_DRINK_GROUPS },
  { slug: "chai-latte-iced", name: "Chai Latte Iced", category: "Signature Chai", sizes: stdSizes(600), groups: HOT_DRINK_GROUPS },
  { slug: "strawberry-horchata-chai", name: "Strawberry Horchata Chai", category: "Signature Chai", sizes: stdSizes(725), groups: HOT_DRINK_GROUPS },
  { slug: "vanilla-chai", name: "Vanilla Chai", category: "Signature Chai", sizes: stdSizes(625), groups: HOT_DRINK_GROUPS },

  // Juice — no price was visible in the screenshots; placeholder, please confirm
  { slug: "strawberry-lemonade", name: "Strawberry Lemonade", category: "Juice", basePriceCents: 500 },

  // Specialty — Caramel Frappe & Strawberry Horchata had no visible price; placeholders, please confirm
  { slug: "caramel-frappe", name: "Caramel Frappe", category: "Specialty", basePriceCents: 650 },
  { slug: "strawberry-horchata", name: "Strawberry Horchata", category: "Specialty", basePriceCents: 675 },

  // Refreshers and Lemonade
  { slug: "red-bull-refresher", name: "Red Bull Refresher", description: "Energy drink refresher with your choice of flavor and add-ons.", category: "Refreshers and Lemonade", sizes: [{ label: "16 oz", priceCents: 625 }, { label: "20 oz", priceCents: 725 }, { label: "24 oz", priceCents: 825 }], groups: REFRESHER_GROUPS, featured: true },
  { slug: "flavored-lemonade", name: "Flavored Lemonade", description: "Lemonade with your choice of flavor and add-ons.", category: "Refreshers and Lemonade", sizes: stdSizes(575), groups: REFRESHER_GROUPS },
  { slug: "classic-lemonade", name: "Classic Lemonade", description: "Classic lemonade with no added flavor.", category: "Refreshers and Lemonade", basePriceCents: 500 },

  // Fall Menu — standard latte-style modifiers, not the refresher flavor list
  { slug: "pumpkin-spice-iced-latte", name: "Pumpkin Spice Iced Latte", category: "Fall Menu", sizes: stdSizes(700), groups: HOT_DRINK_GROUPS },
  { slug: "tres-leches-pumpkin-spice", name: "Tres Leches Pumpkin Spice", category: "Fall Menu", sizes: stdSizes(700), groups: HOT_DRINK_GROUPS },
  { slug: "pumpkin-spice-chai", name: "Pumpkin Spice Chai", category: "Fall Menu", sizes: [{ label: "16 oz", priceCents: 700 }, { label: "20 oz", priceCents: 800 }, { label: "24 oz", priceCents: 900 }], groups: HOT_DRINK_GROUPS },
  { slug: "pumpkin-spice-matcha", name: "Pumpkin Spice Matcha", category: "Fall Menu", sizes: stdSizes(700), groups: HOT_DRINK_GROUPS },

  // Snacks
  { slug: "cheetos-colmillos", name: "Cheetos Colmillos", category: "Snacks", basePriceCents: 550 },
  { slug: "cheetos-flamin-hot", name: "Cheetos Extra Flamin' Hot", category: "Snacks", basePriceCents: 475 },
  { slug: "paketaxo-botanero", name: "Paketaxo Botanero", category: "Snacks", basePriceCents: 550 },
  { slug: "paketaxo-dark", name: "Paketaxo Dark", category: "Snacks", basePriceCents: 550 },
  { slug: "chips-jalapeno", name: "Chips Jalapeño", category: "Snacks", basePriceCents: 475 },
  { slug: "doritos-incognita", name: "Doritos Incognita", category: "Snacks", basePriceCents: 575 },
  { slug: "chipotles-sabor-queso", name: "Chipotles Sabor Queso", category: "Snacks", basePriceCents: 475 },
  { slug: "sabritas-gran-malo", name: "Sabritas Gran Malo", category: "Snacks", basePriceCents: 525 },

  // Pastries — Mini Pancakes' "+" suggests an option Toast didn't show us; flat price placeholder
  { slug: "blueberry-muffin", name: "Blueberry Muffin", category: "Pastries", basePriceCents: 275 },
  { slug: "chocolate-muffin", name: "Chocolate Muffin", category: "Pastries", basePriceCents: 275 },
  { slug: "butter-croissant", name: "Butter Croissant", category: "Pastries", basePriceCents: 275 },
  { slug: "cinnamon-croissant", name: "Cinnamon Croissant", category: "Pastries", basePriceCents: 325 },
  { slug: "mini-pancakes", name: "Mini Pancakes", category: "Pastries", basePriceCents: 1100 },

  // Sago — Ube Sago's Toast price ($800.00) looks like a typo for $8.00, fixed here
  { slug: "strawberry-sago", name: "Strawberry Sago", category: "Sago", basePriceCents: 800 },
  { slug: "mango-sago", name: "Mango Sago", category: "Sago", basePriceCents: 800 },
  { slug: "ube-sago", name: "Ube Sago", category: "Sago", basePriceCents: 800 },
];

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }
  const supabase = createClient(url, key);

  console.log("Wiping existing catalog tables...");
  const wipe = async (table: string, column = "id") => {
    const { error } = await supabase.from(table).delete().not(column, "is", null);
    if (error) throw new Error(`Failed to wipe ${table}: ${error.message}`);
  };
  await wipe("menu_item_modifier_groups", "menu_item_id");
  await wipe("menu_item_sizes");
  await wipe("modifier_options");
  await wipe("modifier_groups");
  await wipe("menu_items");

  console.log("Inserting modifier groups + options...");
  const groupIdByKey = new Map<string, string>();
  for (const group of MODIFIER_GROUPS) {
    const { data: groupRow, error: groupError } = await supabase
      .from("modifier_groups")
      .insert({
        key: group.key,
        label: group.label,
        selection_type: group.selectionType,
        required: group.required,
        max_select: group.maxSelect ?? null,
      })
      .select("id")
      .single();
    if (groupError || !groupRow) throw new Error(`Failed to insert group ${group.key}: ${groupError?.message}`);
    groupIdByKey.set(group.key, groupRow.id);

    const { error: optionsError } = await supabase.from("modifier_options").insert(
      group.options.map((opt, i) => ({
        group_id: groupRow.id,
        label: opt.label,
        price_cents: opt.priceCents,
        sort_order: i,
      }))
    );
    if (optionsError) throw new Error(`Failed to insert options for ${group.key}: ${optionsError.message}`);
  }

  console.log(`Inserting ${ITEMS.length} menu items...`);
  for (const item of ITEMS) {
    const { data: itemRow, error: itemError } = await supabase
      .from("menu_items")
      .insert({
        slug: item.slug,
        name: item.name,
        description: item.description ?? "",
        category: item.category,
        featured: item.featured ?? false,
        has_sizes: !!item.sizes,
        base_price_cents: item.sizes ? 0 : item.basePriceCents,
        // No real product photos yet for the real menu — reuse the same mock
        // photo on featured items only, same placeholder approach as before.
        image_url: item.featured ? "/images/trending-mock.jpeg" : null,
      })
      .select("id")
      .single();
    if (itemError || !itemRow) throw new Error(`Failed to insert item ${item.slug}: ${itemError?.message}`);

    if (item.sizes) {
      const { error: sizesError } = await supabase.from("menu_item_sizes").insert(
        item.sizes.map((s, i) => ({
          menu_item_id: itemRow.id,
          label: s.label,
          price_cents: s.priceCents,
          sort_order: i,
        }))
      );
      if (sizesError) throw new Error(`Failed to insert sizes for ${item.slug}: ${sizesError.message}`);
    }

    if (item.groups?.length) {
      const { error: linkError } = await supabase.from("menu_item_modifier_groups").insert(
        item.groups.map((key) => ({
          menu_item_id: itemRow.id,
          modifier_group_id: groupIdByKey.get(key),
        }))
      );
      if (linkError) throw new Error(`Failed to link groups for ${item.slug}: ${linkError.message}`);
    }
  }

  console.log(`Done. Seeded ${ITEMS.length} items across ${new Set(ITEMS.map((i) => i.category)).size} categories and ${MODIFIER_GROUPS.length} modifier groups.`);
}

main();
