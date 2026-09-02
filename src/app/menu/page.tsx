import MenuBrowser from "@/components/MenuBrowser";
import { getMenu, CATEGORY_ORDER } from "@/lib/menu";

export const revalidate = 0;

export default async function MenuPage() {
  const items = await getMenu();
  const categories = CATEGORY_ORDER.filter((c) => items.some((i) => i.category === c));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-center font-display font-bold text-3xl text-maroon">🌸 Our Menu 🌸</h1>
      <p className="text-center text-ink/60 mt-2">Handcrafted daily.</p>

      <MenuBrowser items={items} categories={categories} />
    </div>
  );
}
