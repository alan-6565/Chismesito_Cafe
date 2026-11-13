// Adds "Soy Milk" (+$0.75, same as Almond/Oat) to the Milk Options group.
// Safe to re-run — skips if it already exists.
// Run with: npx tsx scripts/add-soy-milk.ts
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local", quiet: true });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  const { data: group, error } = await supabase.from("modifier_groups").select("id").eq("key", "milk_options").single();
  if (error || !group) throw new Error(`milk_options group: ${error?.message}`);
  const { data: opts, error: oErr } = await supabase.from("modifier_options").select("label, sort_order").eq("group_id", group.id);
  if (oErr) throw oErr;
  if (opts!.some((o) => o.label.toLowerCase() === "soy milk")) return console.log("Soy Milk already there");
  const sort = Math.max(0, ...opts!.map((o) => o.sort_order)) + 1;
  const { error: iErr } = await supabase.from("modifier_options").insert({ group_id: group.id, label: "Soy Milk", price_cents: 75, sort_order: sort });
  if (iErr) throw iErr;
  console.log("added: Soy Milk +$0.75");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
