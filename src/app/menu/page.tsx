import MenuBrowser from "@/components/MenuBrowser";
import { getMenu } from "@/lib/menu";
import { categoriesFor } from "@/lib/menu-categories";

export const revalidate = 0;

export default async function MenuPage() {
  const items = await getMenu();
  const categories = categoriesFor(items);

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-10">
      <MenuBrowser items={items} categories={categories} />
    </div>
  );
}
