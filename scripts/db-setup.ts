// Creates tables and seeds starting content. Safe to re-run: it only seeds empty tables.
// Usage: npm run db:setup
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
import { DEFAULT_SETTINGS } from "../lib/types.ts";
import { SAMPLE_PRODUCTS } from "./seed-data.ts";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Run `npx neon@latest init` first (see README).");
  process.exit(1);
}
const sql = neon(url);

const schema = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8");
const statements = schema
  .split(/;\s*$/m)
  .map((s) => s.replace(/^\s*--.*$/gm, "").trim())
  .filter(Boolean);
for (const statement of statements) await sql.query(statement);

await sql`INSERT INTO settings (id, data) VALUES (1, ${JSON.stringify(DEFAULT_SETTINGS)}::jsonb) ON CONFLICT (id) DO NOTHING`;

const [{ n }] = await sql`SELECT count(*)::int AS n FROM products`;
if (Number(n) === 0) {
  for (const [i, p] of SAMPLE_PRODUCTS.entries()) {
    await sql`
      INSERT INTO products (title, slug, category, price, compare_at_price, description, dimensions, features, images, published, is_sample, sort_order)
      VALUES (${p.title}, ${p.slug}, ${p.category}, ${p.price}, ${p.compareAtPrice}, ${p.description}, ${p.dimensions},
              ${JSON.stringify(p.features)}::jsonb, ${JSON.stringify(p.images)}::jsonb, ${p.published}, TRUE, ${i})`;
  }
}

const [counts] = await sql`
  SELECT (SELECT count(*)::int FROM products) AS products,
         (SELECT count(*)::int FROM settings) AS settings,
         (SELECT count(*)::int FROM admin_users) AS admins`;
console.log(`products: ${counts.products}, settings: ${counts.settings}, admins: ${counts.admins}`);
if (Number(counts.admins) === 0) console.log("No admin yet. Run: npm run create-admin -- --email=you@example.com");
