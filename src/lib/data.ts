// business/promotion/gallery content — display-only, unrelated to ordering.
// The real menu (items, sizes, modifiers) lives in Supabase; see
// src/lib/menu.ts and scripts/seed-menu.ts.

export const gallery = [
  { id: 1, emoji: "☕", label: "Iced Coffee" },
  { id: 2, emoji: "💚", label: "Matcha" },
  { id: 3, emoji: "🍓", label: "Dubai Strawberry" },
  { id: 4, emoji: "🥐", label: "Bakery" },
  { id: 5, emoji: "🏪", label: "Storefront" },
  { id: 6, emoji: "🌸", label: "Spring Menu" },
  { id: 7, emoji: "📸", label: "Customers" },
  { id: 8, emoji: "🍰", label: "Dessert Cups" },
];

export const promotion = {
  active: true,
  title: "Free Coffee for a Week 🎉",
  description: "We're almost at 3,000 followers on Instagram! Enter for a chance to win.",
  cta: "Enter Giveaway",
};

export const business = {
  name: "Chismesito Cafe",
  tagline: "Coffee with a little chisme",
  subtitle: "Specialty drinks, good vibes, and a place to spill the tea.",
  address: "3230 Macdonald Ave, Richmond, CA 94804",
  hours: "Open 7 Days a Week · 7:00 AM – 8:00 PM",
  phone: "(510) 555-0142",
  instagram: "@chismesitocafe",
  tiktok: "@chismesitocafe",
  facebook: "Chismesito Cafe",
  story:
    "Chismesito Cafe was created with the idea of bringing people together over great coffee, delicious drinks, and even better conversations. What started as a dream between friends turned into a cozy corner of Richmond where neighbors stop in for their daily cup — and stay for the chisme. Thank you for supporting our small business. We can't wait to serve you.",
};
