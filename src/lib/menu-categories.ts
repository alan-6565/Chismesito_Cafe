// Split out from menu.ts (which is "server-only") so client components like
// the admin menu page can import the category order without pulling in
// server-only data-fetching code.
export const CATEGORY_ORDER = [
  "Hot Drinks",
  "Classic Lattes",
  "Signature Matchas",
  "Iced Signature Lattes",
  "Iced Classics Lattes",
  "Signature Chai",
  "Juice",
  "Specialty",
  "Refreshers and Lemonade",
  "Fall Menu",
  "Snacks",
  "Pastries",
  "Sago",
];
