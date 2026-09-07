import { NextRequest, NextResponse } from "next/server";
import { getMenu } from "@/lib/menu";
import { supabaseAdmin } from "@/lib/supabase";
import { CATEGORY_ORDER } from "@/lib/menu-categories";

export async function GET() {
  const items = await getMenu();
  return NextResponse.json({ items });
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// New items are added flat-priced with no sizes/modifiers — covers the
// common case (a new pastry, a new simple drink). Sizes/modifiers still
// need a direct database edit for now.
export async function POST(req: NextRequest) {
  const { name, category, description, priceCents } = (await req.json()) as {
    name?: string;
    category?: string;
    description?: string;
    priceCents?: number;
  };

  if (!name?.trim() || !category || !CATEGORY_ORDER.includes(category)) {
    return NextResponse.json({ error: "Name and a valid category are required" }, { status: 400 });
  }
  if (!priceCents || priceCents <= 0) {
    return NextResponse.json({ error: "Please enter a price" }, { status: 400 });
  }

  const baseSlug = slugify(name);
  if (!baseSlug) {
    return NextResponse.json({ error: "Please use a name with letters or numbers" }, { status: 400 });
  }

  let slug = baseSlug;
  for (let i = 2; ; i++) {
    const { data: existing } = await supabaseAdmin.from("menu_items").select("id").eq("slug", slug).maybeSingle();
    if (!existing) break;
    slug = `${baseSlug}-${i}`;
  }

  const { data, error } = await supabaseAdmin
    .from("menu_items")
    .insert({
      slug,
      name: name.trim(),
      description: description?.trim() ?? "",
      category,
      base_price_cents: Math.round(priceCents),
      has_sizes: false,
      available: true,
      featured: false,
    })
    .select("id")
    .single();

  if (error || !data) return NextResponse.json({ error: "Could not create item" }, { status: 500 });

  return NextResponse.json({ ok: true, id: data.id });
}
