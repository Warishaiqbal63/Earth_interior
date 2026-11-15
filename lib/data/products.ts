import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";
import type { Category, Product, ProductImage, ProductInput } from "@/lib/types";

type Row = Record<string, unknown>;

function toProduct(r: Row): Product {
  return {
    id: Number(r.id),
    title: String(r.title),
    slug: String(r.slug),
    category: String(r.category) as Category,
    price: r.price === null ? null : Number(r.price),
    compareAtPrice: r.compare_at_price === null ? null : Number(r.compare_at_price),
    description: String(r.description ?? ""),
    dimensions: String(r.dimensions ?? ""),
    features: Array.isArray(r.features) ? (r.features as string[]) : [],
    images: Array.isArray(r.images) ? (r.images as ProductImage[]) : [],
    sortOrder: Number(r.sort_order),
    published: Boolean(r.published),
    isSample: Boolean(r.is_sample),
    updatedAt: new Date(r.updated_at as string).toISOString(),
  };
}

/* ------------------------------ Public (cached) ------------------------------ */

export async function getPublishedProducts(): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  const rows = await db()`SELECT * FROM products WHERE published ORDER BY sort_order ASC, id DESC`;
  return rows.map(toProduct);
}

export async function getPublishedProductBySlug(slug: string): Promise<Product | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  const rows = await db()`SELECT * FROM products WHERE slug = ${slug} AND published LIMIT 1`;
  return rows[0] ? toProduct(rows[0]) : null;
}

/* ------------------------------- Admin (live) ------------------------------- */

export type ProductFilter = { q?: string; category?: string; status?: "all" | "published" | "hidden" };

export async function listAllProducts(filter: ProductFilter = {}): Promise<Product[]> {
  const q = filter.q?.trim() ? `%${filter.q.trim()}%` : null;
  const category = filter.category || null;
  const status = filter.status ?? "all";
  const rows = await db()`
    SELECT * FROM products
    WHERE (${q}::text IS NULL OR title ILIKE ${q} OR slug ILIKE ${q})
      AND (${category}::text IS NULL OR category = ${category})
      AND (${status} = 'all' OR (${status} = 'published' AND published) OR (${status} = 'hidden' AND NOT published))
    ORDER BY sort_order ASC, id DESC`;
  return rows.map(toProduct);
}

export async function getProductById(id: number): Promise<Product | null> {
  const rows = await db()`SELECT * FROM products WHERE id = ${id} LIMIT 1`;
  return rows[0] ? toProduct(rows[0]) : null;
}

export async function takenSlugs(excludeId?: number): Promise<Set<string>> {
  const rows = await db()`SELECT slug FROM products WHERE ${excludeId ?? null}::int IS NULL OR id <> ${excludeId ?? null}`;
  return new Set(rows.map((r) => String(r.slug)));
}

export async function createProduct(p: ProductInput): Promise<number> {
  const rows = await db()`
    INSERT INTO products (title, slug, category, price, compare_at_price, description, dimensions, features, images, published, sort_order)
    VALUES (${p.title}, ${p.slug}, ${p.category}, ${p.price}, ${p.compareAtPrice}, ${p.description}, ${p.dimensions},
            ${JSON.stringify(p.features)}::jsonb, ${JSON.stringify(p.images)}::jsonb, ${p.published},
            (SELECT COALESCE(MIN(sort_order), 0) - 1 FROM products))
    RETURNING id`;
  return Number(rows[0].id);
}

/** Returns false when the product no longer exists. */
export async function updateProduct(id: number, p: ProductInput): Promise<boolean> {
  const rows = await db()`
    UPDATE products SET
      title = ${p.title}, slug = ${p.slug}, category = ${p.category}, price = ${p.price},
      compare_at_price = ${p.compareAtPrice}, description = ${p.description}, dimensions = ${p.dimensions},
      features = ${JSON.stringify(p.features)}::jsonb, images = ${JSON.stringify(p.images)}::jsonb,
      published = ${p.published}, is_sample = FALSE, updated_at = now()
    WHERE id = ${id}
    RETURNING id`;
  return rows.length > 0;
}

/** Deletes the product and returns its images so the caller can remove the files. */
export async function deleteProduct(id: number): Promise<ProductImage[] | null> {
  const rows = await db()`DELETE FROM products WHERE id = ${id} RETURNING images`;
  return rows[0] ? ((rows[0].images as ProductImage[]) ?? []) : null;
}

export async function setPublished(id: number, published: boolean): Promise<boolean> {
  const rows = await db()`UPDATE products SET published = ${published}, updated_at = now() WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}

/** Swaps a product with its neighbour in display order, renumbering everything 0..n. */
export async function moveProduct(id: number, dir: "up" | "down"): Promise<boolean> {
  const rows = await db()`SELECT id FROM products ORDER BY sort_order ASC, id DESC`;
  const ids = rows.map((r) => Number(r.id));
  const i = ids.indexOf(id);
  const j = dir === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= ids.length) return false;
  [ids[i], ids[j]] = [ids[j], ids[i]];
  const order = ids.map((_, k) => k);
  await db()`
    UPDATE products p SET sort_order = v.ord
    FROM unnest(${ids}::int[], ${order}::int[]) AS v(id, ord)
    WHERE p.id = v.id`;
  return true;
}

export async function countSampleProducts(): Promise<number> {
  const rows = await db()`SELECT count(*)::int AS n FROM products WHERE is_sample`;
  return Number(rows[0].n);
}

export async function deleteSampleProducts(): Promise<ProductImage[]> {
  const rows = await db()`DELETE FROM products WHERE is_sample RETURNING images`;
  return rows.flatMap((r) => (r.images as ProductImage[]) ?? []);
}

export async function productCounts(): Promise<{ published: number; hidden: number }> {
  const rows = await db()`
    SELECT count(*) FILTER (WHERE published)::int AS published, count(*) FILTER (WHERE NOT published)::int AS hidden
    FROM products`;
  return { published: Number(rows[0].published), hidden: Number(rows[0].hidden) };
}
