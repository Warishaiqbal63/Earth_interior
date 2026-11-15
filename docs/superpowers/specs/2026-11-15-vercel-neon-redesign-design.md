# Furniture service site — Vercel + Neon rebuild & redesign

Date: 2026-11-15 · Status: draft for approval

## Intent

A custom-furniture **service** (made-to-order, workshop in Lahore) needs a site that makes local
Pakistani customers trust it enough to call or WhatsApp. Today it is a Vite SPA + PHP/MySQL API on
cPanel, branded "Klyron" in crimson. The owner is moving hosting to **Vercel**, wants the database on
**Neon** (project `plain-silence-55734952`, org `org-jolly-breeze-71327287`), the Klyron brand removed
(no name yet), a full redesign focused on conversion + local SEO + trust, and an admin panel that is
easy for a non-technical shop owner and handles edge cases.

## Goals
- Every page answers "can I trust these people?" and offers one obvious next step: **WhatsApp**,
  **Call**, or **Request a callback**.
- Server-rendered pages so Google indexes each product and the business (local SEO).
- Business identity (name, phone, WhatsApp, address, hours, map link, city) **editable in the admin**,
  so branding can be added later without a code change or rebuild.
- Admin a shop owner can run from a phone: add/edit/hide/reorder/delete products, upload photos,
  read callback requests, edit business details.

## Non-goals
- No cart, checkout, online payment, or customer accounts.
- No multi-admin roles (single admin; table allows more).
- No blog/CMS pages beyond products and business settings.
- Migrating the old MySQL data (owner chose to start empty with sample items).

## Anti-goals (failure even if it "works")
- Fake trust: no invented reviews in structured data, no fake "X customers served" counters presented
  as fact. Sample testimonials/stats are clearly placeholder content stored in settings, editable, and
  never emitted as `Review`/`AggregateRating` schema.
- Leftover "Klyron" name or crimson anywhere.
- Connection strings or secrets in client code, chat, or committed files.

## Constraints
- Hosting: Vercel. DB: Neon Postgres. Images: Vercel Blob (owner will create the store; see last section).
- Site must run before Blob exists: sample products use static images in `public/samples/`
  (copied from current `uploads/`), and upload shows a clear "image storage not configured" message
  when `BLOB_READ_WRITE_TOKEN` is missing.
- Neon connection is set up per https://neon.com/get-started/prompt.md (`neon init` with the project
  and org IDs), which writes `DATABASE_URL` to `.env`. Running it needs the owner's permission/login.
- Audience: Pakistan. Prices in PKR (`Rs. 125,000`), phone/WhatsApp in `+92` format, English copy.

## Approaches considered
1. **Next.js (App Router) on Vercel — chosen.** Server-rendered pages give each product its own URL,
   metadata and sitemap entry; Neon via `@neondatabase/serverless`; images via Vercel Blob + `next/image`
   (replaces the 660-line PHP image pipeline). Cost: most components rewritten — acceptable since the
   whole UI is being redesigned anyway.
2. Keep Vite SPA + Vercel Functions in `/api`. Less churn, but catalog stays client-rendered, keeping
   the site's main SEO weakness. Rejected.
3. Keep PHP, point at Neon. Ruled out by the move off cPanel.

## Decided
- Stack: Next.js (latest stable, App Router, JS — matching the current codebase), Tailwind CSS v4,
  lucide-react, `@neondatabase/serverless`, `@vercel/blob`, `bcryptjs`, `jose` (signed session cookie).
- Old PHP (`api/`, `db/`, `index.php`, `.htaccess`, `uploads/`), Vite config, `dist/`, and the
  duplicate nested `furniture website/` folder are removed. `design-system/klyron-furniture` removed.

## Design (builder's starting point)

### Visual identity (no name)
- Placeholder name from settings, default **"Lahore Custom Furniture"** style text-only wordmark
  (editable); no logo image.
- Palette: ground `#F7F5F0` (warm off-white), surface `#FFFFFF`, ink `#1C2321`, muted `#5E6662`,
  line `#E4E0D8`, primary **deep green `#1F5C4A`** (trust, calm; buttons/links), primary-hover
  `#174636`, accent **warm wood `#A0703F`** for small highlights only, WhatsApp button `#1EA952`.
  All text pairs ≥ 4.5:1.
- Type: Inter for UI/body; a restrained serif (Fraunces) for headings. Self-hosted via `next/font`.
- Light theme only, generous spacing, rounded-lg cards, subtle shadow, minimal motion respecting
  `prefers-reduced-motion`.

### Public pages
- `/` Home: hero (made-to-order furniture in {city}, WhatsApp + Call buttons, 3 trust points),
  trust bar (free home measurement, custom sizes, workshop visits welcome, warranty — all editable
  text), categories, featured products, "How it works" (Share idea → Measure & quote → Built & delivered),
  testimonials (placeholder, editable), FAQ (with `FAQPage` schema), Visit the workshop (address, hours,
  map link), callback form.
- `/furniture` catalog: category filter + search via URL query (shareable, crawlable), empty/no-results
  states.
- `/furniture/[slug]`: gallery, price or "Price on request", dimensions, features, description,
  WhatsApp prefilled with product name + URL, call, callback form; related items; `Product` schema
  without `offers` unless a price is set; 404 for missing/unpublished.
- `sitemap.xml`, `robots.txt` (disallow `/admin`, `/api`), `LocalBusiness`/`FurnitureStore` JSON-LD from
  settings, Open Graph per page, canonical URLs from `SITE_URL`.
- Mobile sticky bar: WhatsApp + Call.

### Admin (`/admin`)
- Sign-in (email + password, bcrypt, rate limit 5 fails / 15 min per IP and per email, generic error,
  httpOnly SameSite=Lax Secure cookie signed with `SESSION_SECRET`, 12h expiry). Middleware protects
  `/admin/*` and admin API routes. Mutations via Server Actions (built-in CSRF protection by origin check).
- Products list: search, category filter, published/hidden filter, thumbnail, show/hide toggle,
  move up/down, edit, delete with confirm; empty state with "Add your first product".
- Product form: title (slug auto, editable, uniqueness enforced with friendly error), category (from a
  fixed list), price/compare-at (optional, integer PKR, compare-at must exceed price), description,
  dimensions, features (one per line), up to 8 images (drag to reorder, first = cover, alt text required
  per image, JPG/PNG/WebP ≤ 8MB, client-side check before upload, progress, retry on failure),
  published toggle. Unsaved-changes warning on leave. Field-level errors. Save disabled while uploading.
- Callback requests inbox: name, phone, product (if any), message, time; mark handled; delete.
- Settings: business name, tagline, city, phone, WhatsApp, address parts, hours, map URL, trust points,
  testimonials, FAQ. Validates phone formats.
- Session expiry mid-edit: show "Signed out — sign in again" without losing the form (draft kept in
  sessionStorage).
- Deleting a product removes its Blob images.

### Data (Neon)
- `products` (id, title, slug unique, category, price, compare_at_price, description, dimensions,
  features jsonb, images jsonb `[{url, alt, width, height}]`, sort_order, published, timestamps)
- `settings` (single row, jsonb)
- `leads` (id, name, phone, product_id null, message, handled, created_at)
- `admin_users`, `login_attempts`
- Migration as a plain SQL file + `npm run db:setup` (creates tables, seeds ~8 sample products using
  `public/samples/*` images and default settings). `npm run create-admin -- --email=…` prompts for password.
- Callback form: server-side validation (name 2–80 chars, Pakistani phone), honeypot field, rate limit
  per IP (5/hour) using the attempts pattern.

### Env vars
`DATABASE_URL` (from `neon init`), `BLOB_READ_WRITE_TOKEN` (from Vercel Blob), `SESSION_SECRET`,
`SITE_URL`. `.env.example` documents them; `.env` git-ignored.

### Owner decisions (approval)
- **Approved 2026-11-15.** Brand name: **Earth Interior** (default in settings, still editable).
- Build inside the owner's scaffold `earth-interior/` (Next.js 16.4.6, React 19.3, TypeScript,
  Tailwind 4.3 via `@tailwindcss/turbopack`, `cacheComponents: true`, git already initialised).
  TypeScript replaces the "JS" call above. Follow `earth-interior/AGENTS.md`: read
  `node_modules/next/dist/docs/` before using Next APIs.

### Owner decisions (review round)
- **Lead alerts: admin inbox only.** No email/SMS provider. The admin nav shows an unread-count badge
  on "Callback requests", and the dashboard home lists the newest unhandled requests first.
- **Deploy: new Vercel project imported from GitHub.** The builder initialises git (with a
  `.gitignore` that excludes `.env*`, `node_modules`, `.next`); the owner pushes to a new GitHub repo.
  Every push auto-deploys. The final browser-agent prompt covers: import the repo as a new Vercel
  project, create + connect a Blob store, connect Neon (Neon's Vercel integration, or paste
  `DATABASE_URL` from the Neon console), set `SESSION_SECRET` (random) and optionally `SITE_URL`,
  redeploy — never printing secret values.

### Builder calls (made during review)
- **One shared Neon database** for preview and production (simplest; single owner). `db:setup` is
  idempotent: creates tables if missing, seeds samples/settings only when the tables are empty.
- **Sample products** carry `is_sample = true`; admin shows a banner "Sample products are showing —
  remove them all" with a one-click confirmed removal. Samples never get `Product` schema.
- **`SITE_URL`** falls back to `https://$VERCEL_PROJECT_PRODUCTION_URL` when unset; adding a custom
  domain later is an env-var edit plus Vercel's own domain redirect.

## Left to the builder
File layout, component breakdown, exact copy wording, sample product data, styling details within the
palette above.

## Deliverable at the end
A copy-paste prompt the owner can give a browser agent signed into their Vercel account to create a
Blob store, connect it to the project, and confirm `BLOB_READ_WRITE_TOKEN` exists — without printing
the token.
