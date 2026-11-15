import {
  CATEGORIES,
  type Category,
  type LeadInput,
  type ProductImage,
  type ProductInput,
  type Settings,
  type ValidationResult,
} from "./types.ts";
import { normalizePkPhone } from "./phone.ts";
import { slugify } from "./slug.ts";

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const MAX_PRICE = 100_000_000;
export const MAX_IMAGES = 8;

function parsePrice(v: unknown): number | null | "invalid" {
  if (v === null || v === undefined) return null;
  const s = String(v).replace(/[,\s]/g, "").replace(/^rs\.?/i, "");
  if (s === "") return null;
  if (!/^\d+$/.test(s)) return "invalid";
  const n = Number(s);
  return n > 0 && n <= MAX_PRICE ? n : "invalid";
}

/** Neon Object Storage bucket that holds product photos (declared in neon.ts). */
export const IMAGE_BUCKET = "product-images";

/** Only our sample photos or files in our own public bucket may be attached to a product. */
export function isAllowedImageUrl(url: string): boolean {
  if (url.startsWith("/samples/")) return /^\/samples\/[a-z0-9-]+\.(webp|jpg|jpeg|png)$/.test(url);
  const endpoint = process.env.AWS_ENDPOINT_URL_S3;
  if (!endpoint) return false;
  try {
    const u = new URL(url);
    const base = new URL(endpoint);
    return u.protocol === "https:" && u.host === base.host && u.pathname.startsWith(`/${IMAGE_BUCKET}/products/`);
  } catch {
    return false;
  }
}

function parseImages(v: unknown, errors: Record<string, string>): ProductImage[] {
  const list = Array.isArray(v) ? v : [];
  if (list.length > MAX_IMAGES) errors.images = `Up to ${MAX_IMAGES} photos per product.`;
  const images: ProductImage[] = [];
  list.slice(0, MAX_IMAGES).forEach((raw, i) => {
    const r = (raw ?? {}) as Record<string, unknown>;
    const url = str(r.url);
    const alt = str(r.alt).slice(0, 200);
    if (!isAllowedImageUrl(url)) {
      errors.images = "One of the photos has an invalid address. Remove it and upload it again.";
    } else if (!alt) {
      errors[`images.${i}.alt`] = "Describe this photo (used by Google and screen readers).";
    }
    images.push({
      url,
      alt,
      width: Math.max(0, Math.round(Number(r.width) || 0)),
      height: Math.max(0, Math.round(Number(r.height) || 0)),
    });
  });
  return images;
}

export function validateProduct(input: unknown): ValidationResult<ProductInput> {
  const d = (input ?? {}) as Record<string, unknown>;
  const errors: Record<string, string> = {};

  const title = str(d.title);
  if (!title) errors.title = "Enter a product name.";
  else if (title.length > 120) errors.title = "Keep the name under 120 characters.";

  const slug = slugify(str(d.slug) || title);

  const category = str(d.category) as Category;
  if (!CATEGORIES.includes(category)) errors.category = "Choose a category.";

  const price = parsePrice(d.price);
  if (price === "invalid") errors.price = "Enter the price in rupees, numbers only (e.g. 125000).";
  const compareAtPrice = parsePrice(d.compareAtPrice);
  if (compareAtPrice === "invalid") {
    errors.compareAtPrice = "Enter the old price in rupees, numbers only.";
  } else if (compareAtPrice !== null) {
    if (price === null) errors.compareAtPrice = "Add the current price first, or leave the old price empty.";
    else if (typeof price === "number" && compareAtPrice <= price)
      errors.compareAtPrice = "The old price must be higher than the price.";
  }

  const description = str(d.description);
  if (description.length > 4000) errors.description = "Keep the description under 4,000 characters.";
  const dimensions = str(d.dimensions).slice(0, 150);

  const featureLines = Array.isArray(d.features) ? d.features.map(String) : str(d.features).split(/\r?\n/);
  const features = featureLines.map((f) => f.trim()).filter(Boolean);
  if (features.length > 20) errors.features = "Up to 20 features, one per line.";
  else if (features.some((f) => f.length > 150)) errors.features = "Keep each feature under 150 characters.";

  const images = parseImages(d.images, errors);
  const published =
    d.published === undefined ? true : d.published === true || d.published === "true" || d.published === "on";

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    value: {
      title,
      slug,
      category,
      price: price as number | null,
      compareAtPrice: compareAtPrice as number | null,
      description,
      dimensions,
      features,
      images,
      published,
    },
  };
}

export function validateLead(input: unknown): ValidationResult<LeadInput> {
  const d = (input ?? {}) as Record<string, unknown>;
  const errors: Record<string, string> = {};
  // Honeypot: a hidden field real visitors never fill.
  if (str(d.website)) return { ok: false, errors: { form: "Could not send. Please call or WhatsApp us instead." } };

  const name = str(d.name);
  if (name.length < 2 || name.length > 80) errors.name = "Enter your name (2 to 80 characters).";
  const phone = normalizePkPhone(str(d.phone));
  if (!phone) errors.phone = "Enter a Pakistani number, e.g. 0300 1234567.";
  const message = str(d.message);
  if (message.length > 1000) errors.message = "Keep the message under 1,000 characters.";
  const pid = Number(str(d.productId));
  const productId = Number.isInteger(pid) && pid > 0 ? pid : null;

  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value: { name, phone: phone!, message, productId } };
}

function lines(v: unknown): string[] {
  const arr = Array.isArray(v) ? v.map(String) : str(v).split(/\r?\n/);
  return arr.map((s) => s.trim()).filter(Boolean);
}

export function validateSettings(input: unknown): ValidationResult<Settings> {
  const d = (input ?? {}) as Record<string, unknown>;
  const errors: Record<string, string> = {};
  const need = (key: string, label: string, max = 120) => {
    const v = str(d[key]);
    if (!v) errors[key] = `Enter the ${label}.`;
    else if (v.length > max) errors[key] = `Keep the ${label} under ${max} characters.`;
    return v;
  };

  const businessName = need("businessName", "business name", 60);
  const tagline = str(d.tagline).slice(0, 120);
  const city = need("city", "city", 40);
  const phone = normalizePkPhone(str(d.phone));
  if (!phone) errors.phone = "Enter a Pakistani number, e.g. 0300 1234567 or 042 35761234.";
  const whatsapp = normalizePkPhone(str(d.whatsapp));
  if (!whatsapp || !/^\+923\d{9}$/.test(whatsapp))
    errors.whatsapp = "Enter a Pakistani mobile number that has WhatsApp, e.g. 0300 1234567.";
  const email = str(d.email);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email, or leave it empty.";
  const addressStreet = need("addressStreet", "street address");
  const addressArea = str(d.addressArea).slice(0, 80);
  const addressCity = need("addressCity", "city in the address", 40);
  const mapUrl = str(d.mapUrl);
  if (mapUrl && !/^https:\/\//.test(mapUrl)) errors.mapUrl = "Paste the full Google Maps link, starting with https://";
  const hours = need("hours", "opening hours");

  const trustPoints = lines(d.trustPoints).slice(0, 6);
  const testimonials = (Array.isArray(d.testimonials) ? d.testimonials : [])
    .map((t) => {
      const r = (t ?? {}) as Record<string, unknown>;
      return { name: str(r.name).slice(0, 60), area: str(r.area).slice(0, 60), quote: str(r.quote).slice(0, 500) };
    })
    .filter((t) => t.name && t.quote)
    .slice(0, 12);
  const faqs = (Array.isArray(d.faqs) ? d.faqs : [])
    .map((f) => {
      const r = (f ?? {}) as Record<string, unknown>;
      return { q: str(r.q).slice(0, 200), a: str(r.a).slice(0, 1000) };
    })
    .filter((f) => f.q && f.a)
    .slice(0, 20);

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    value: {
      businessName,
      tagline,
      city,
      phone: phone!,
      whatsapp: whatsapp!,
      email,
      addressStreet,
      addressArea,
      addressCity,
      mapUrl,
      hours,
      trustPoints,
      testimonials,
      faqs,
    },
  };
}
