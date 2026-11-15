import type { MetadataRoute } from "next";
import { getPublishedProducts } from "@/lib/data/products";
import { getSiteUrl } from "@/lib/site-url";
import { CATEGORIES } from "@/lib/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const products = await getPublishedProducts();
  const latest = products.reduce((max, p) => (p.updatedAt > max ? p.updatedAt : max), "1970-01-01T00:00:00.000Z");
  const used = CATEGORIES.filter((c) => products.some((p) => p.category === c));
  return [
    { url: `${base}/`, lastModified: latest, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/portfolio`, lastModified: latest, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/furniture`, lastModified: latest, changeFrequency: "weekly", priority: 0.9 },
    ...used.map((c) => ({
      url: `${base}/furniture?category=${encodeURIComponent(c)}`,
      lastModified: latest,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...products.map((p) => ({
      url: `${base}/furniture/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
