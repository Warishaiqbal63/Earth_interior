import { getSiteUrl } from "./site-url.ts";
import type { Product, Settings } from "./types.ts";

export function businessJsonLd(s: Settings) {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "FurnitureStore",
    "@id": `${url}/#business`,
    name: s.businessName,
    description: `${s.tagline}. Made-to-order furniture in ${s.city}.`,
    url,
    telephone: s.phone,
    ...(s.email ? { email: s.email } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: [s.addressStreet, s.addressArea].filter(Boolean).join(", "),
      addressLocality: s.addressCity,
      addressCountry: "PK",
    },
    ...(s.mapUrl ? { hasMap: s.mapUrl } : {}),
    areaServed: s.city,
    priceRange: "Rs.",
  };
}

export function faqJsonLd(s: Settings) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: s.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/** Product markup only for real (non-sample) products; offers only when a price is set. */
export function productJsonLd(p: Product, s: Settings) {
  if (p.isSample) return null;
  const url = `${getSiteUrl()}/furniture/${p.slug}`;
  const images = p.images.map((i) => (i.url.startsWith("/") ? `${getSiteUrl()}${i.url}` : i.url));
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.title,
    url,
    category: p.category,
    ...(images.length ? { image: images } : {}),
    ...(p.description ? { description: p.description } : {}),
    brand: { "@type": "Brand", name: s.businessName },
    ...(p.price
      ? {
          offers: {
            "@type": "Offer",
            price: p.price,
            priceCurrency: "PKR",
            availability: "https://schema.org/MadeToOrder",
            url,
          },
        }
      : {}),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  const base = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${base}${it.path}`,
    })),
  };
}
