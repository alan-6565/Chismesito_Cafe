// Split out from menu.ts (which is "server-only") so client components like
// the admin menu page can import the category order without pulling in
// server-only data-fetching code.
export const CATEGORY_ORDER = [
  "Signature Drinks",
  "Lattes",
  "Matcha",
  "Chai",
  "Coffee & Hot Drinks",
  "Fall Menu",
  "Refreshers and Lemonade",
  "Sago",
  "Pastries",
  "Snacks",
];

/**
 * Categories present in `items`, in CATEGORY_ORDER, with any category not
 * listed there appended at the end — so a renamed or new category in the
 * database still shows up instead of silently hiding its items.
 */
export function categoriesFor(items: { category: string }[]): string[] {
  const present = new Set(items.map((i) => i.category));
  const known = CATEGORY_ORDER.filter((c) => present.has(c));
  const unknown = [...present].filter((c) => !CATEGORY_ORDER.includes(c)).sort();
  return [...known, ...unknown];
}
