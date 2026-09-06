import type { MetadataRoute } from "next";

const SITE_URL = "https://chismesitocafe.com";

const ROUTES: { path: string; changeFrequency: "daily" | "monthly"; priority: number }[] = [
  { path: "", changeFrequency: "daily", priority: 1 },
  { path: "/menu", changeFrequency: "daily", priority: 0.9 },
  { path: "/order", changeFrequency: "monthly", priority: 0.8 },
  { path: "/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/gallery", changeFrequency: "monthly", priority: 0.5 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.6 },
  { path: "/privacy", changeFrequency: "monthly", priority: 0.2 },
  { path: "/terms", changeFrequency: "monthly", priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
