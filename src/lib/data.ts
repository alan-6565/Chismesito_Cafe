// business/promotion/gallery content — display-only, unrelated to ordering.
// The real menu (items, sizes, modifiers) lives in Supabase; see
// src/lib/menu.ts and scripts/seed-menu.ts.

export const gallery = [
  { id: 1, emoji: "☕", label: "Iced Coffee" },
  { id: 2, emoji: "💚", label: "Matcha", image: "/images/gallery-matcha.png" },
  { id: 4, emoji: "🥐", label: "Bakery", image: "/images/bakery.png" },
  { id: 5, emoji: "🏪", label: "Storefront", image: "/images/storefront.png" },
  { id: 6, emoji: "🌸", label: "Spring Menu" },
  { id: 7, emoji: "📸", label: "Customers", image: "/images/community.png" },
  { id: 8, emoji: "🍰", label: "Dessert Cups", image: "/images/gallery-cookies.png" },
];

export const promotion = {
  // Not yet confirmed with the client — flip to true once a real promo is
  // agreed on. Homepage banner is hidden entirely while false.
  active: false,
  title: "Free Coffee for a Week 🎉",
  description: "We're almost at 3,000 followers on Instagram! Enter for a chance to win.",
  cta: "Enter Giveaway",
};

export type PromoSlide = { id: string; image: string; alt: string; href?: string };

// Auto-rotating banner on the homepage. Add more slides here as real promo
// photos come in — each one should match a 2484x1032 (~2.4:1) aspect ratio
// to match the existing seasonal banner and avoid awkward cropping.
export const promoSlides: PromoSlide[] = [
  {
    id: "spring-seasonal",
    image: "/images/seasonal-banner.png",
    alt: "Chismesito Cafe spring seasonal drinks — Pistachio Matcha Latte and Strawberry Crunch Latte",
    href: "/menu",
  },
];

const streetAddress = "1723 Barrett Ave";
const city = "Richmond";
const state = "CA";
const zip = "94801";

export const business = {
  name: "Chismesito Cafe",
  tagline: "Coffee with a little chisme",
  subtitle: "Specialty drinks, good vibes, and a place to spill the tea.",
  streetAddress,
  city,
  state,
  zip,
  address: `${streetAddress}, ${city}, ${state} ${zip}`,
  hours: "Mon–Fri 7:00 AM – 7:00 PM · Sat–Sun 8:00 AM – 7:00 PM",
  phone: "(510) 691-3583",
  instagram: "@chismesito__cafe",
  instagramUrl: "https://www.instagram.com/chismesito__cafe",
  doordashUrl:
    "https://www.doordash.com/en/store/chismesito-cafe-richmond-46863232/112528855/?srsltid=AfmBOooTrX8BaXsk3e0zcuyZtOBN34yoTL3niaIafowiZoebURYRvVMk",
  story:
    "Chismesito Cafe was created with the idea of bringing people together over great coffee, delicious drinks, and even better conversations. What started as a dream between friends turned into a cozy corner of Richmond where neighbors stop in for their daily cup — and stay for the chisme. Thank you for supporting our small business. We can't wait to serve you.",
};

// Kept structured (rather than parsed from the display `hours` string above)
// so the "Open Now" badge and search-engine structured data can't drift out
// of sync with each other. days: 0=Sun..6=Sat.
export const openingHours: { days: number[]; opens: string; closes: string }[] = [
  { days: [1, 2, 3, 4, 5], opens: "07:00", closes: "19:00" },
  { days: [0, 6], opens: "08:00", closes: "19:00" },
];
