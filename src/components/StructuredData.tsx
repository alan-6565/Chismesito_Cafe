import { business, openingHours } from "@/lib/data";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SITE_URL = "https://chismesitocafe.com";

// Lets Google show hours/address/rating directly in search results and
// Maps instead of just a plain link.
export default function StructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    name: business.name,
    description: business.subtitle,
    image: `${SITE_URL}/images/hero.png`,
    url: SITE_URL,
    telephone: business.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.streetAddress,
      addressLocality: business.city,
      addressRegion: business.state,
      postalCode: business.zip,
      addressCountry: "US",
    },
    servesCuisine: "Coffee",
    openingHoursSpecification: openingHours.map(({ days, opens, closes }) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: days.map((d) => DAY_NAMES[d]),
      opens,
      closes,
    })),
    sameAs: [business.instagramUrl],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
