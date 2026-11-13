// business/promotion/gallery content — display-only, unrelated to ordering.
// The real menu (items, sizes, modifiers) lives in Supabase; see
// src/lib/menu.ts and scripts/seed-menu.ts.

// Cafe photos for the Gallery page. Drink photos uploaded in /admin/menu are
// added automatically on top of these. w/h are the real pixel sizes so the
// wall keeps each photo's true shape.
export type GalleryPhoto = { src: string; alt: string; tag: "Drinks" | "The Cafe" | "Our People"; w: number; h: number };

export const gallery: GalleryPhoto[] = [
  { src: "/images/gallery-matcha.png", alt: "Grab-and-go matchas and strawberry drinks in the fridge", tag: "Drinks", w: 1010, h: 1404 },
  { src: "/images/storefront.png", alt: "The Chismesito Cafe storefront on Barrett Ave", tag: "The Cafe", w: 1682, h: 900 },
  { src: "/images/community.png", alt: "Friends toasting Chismesito iced drinks", tag: "Our People", w: 724, h: 876 },
  { src: "/images/about-street.png", alt: "Chismesito Cafe sign over Barrett Ave", tag: "The Cafe", w: 468, h: 882 },
  { src: "/images/about-drinks.png", alt: "A lineup of handcrafted iced drinks", tag: "Drinks", w: 1000, h: 540 },
  { src: "/images/bakery.png", alt: "The pastry case at the counter", tag: "The Cafe", w: 746, h: 922 },
  { src: "/images/contact-storefront.png", alt: "Outside Chismesito Cafe in Richmond", tag: "The Cafe", w: 1200, h: 1046 },
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
    id: "fall-menu",
    image: "/images/fall-menu-banner.png",
    alt: "Chismesito Cafe Fall Menu — Pumpkin Spice Latte, Pumpkin Chai, Pumpkin Tres Leches Latte, and Pumpkin Matcha",
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
  hours: "Mon–Fri 6:00 AM – 5:00 PM · Sat–Sun 7:00 AM – 5:00 PM",
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
  { days: [1, 2, 3, 4, 5], opens: "06:00", closes: "17:00" },
  { days: [0, 6], opens: "07:00", closes: "17:00" },
];
