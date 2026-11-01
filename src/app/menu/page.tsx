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
      <p className="mt-10 text-center text-xs text-ink/50">
        Online orders include a card processing fee (about 3% + 30¢) that covers card charges. It’s shown at checkout before you pay.
      </p>
    </div>
  );
}
