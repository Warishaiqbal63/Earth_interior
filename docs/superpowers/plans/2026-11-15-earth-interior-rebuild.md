# Earth Interior Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Klyron Vite/PHP/MySQL site with "Earth Interior", a Next.js 16 site on Vercel backed by Neon and Vercel Blob, with a trust- and conversion-focused public site and an easy admin panel.

**Architecture:** Next.js App Router with `cacheComponents`. Public pages read Neon through `'use cache'` functions tagged `products` / `settings`; admin Server Actions mutate and call `updateTag`. The admin is protected by a signed-cookie session checked in `proxy.ts` (fast redirect) and again in every admin action/page (authoritative). Photos upload from the browser straight to Vercel Blob via a token route.

**Tech Stack:** Next.js 16.4.6, React 19.3, TypeScript, Tailwind 4.3, `@neondatabase/serverless`, `@vercel/blob`, `bcryptjs`, `jose`, `lucide-react`. Tests: `node --test` (Node 24 strips TS natively) on pure modules in `lib/`.

**Spec:** `docs/superpowers/specs/2026-11-15-vercel-neon-redesign-design.md`

## Global Constraints
- All work in `earth-interior/`. Read `node_modules/next/dist/docs/` before using any Next API (AGENTS.md). Middleware is `proxy.ts` in this version.
- Brand default name **"Earth Interior"**, city **Lahore**; all business details come from the `settings` row, never hard-coded in components.
- Palette tokens: ground `#F7F5F0`, surface `#FFFFFF`, ink `#1C2321`, muted `#5E6662`, line `#E4E0D8`, primary `#1F5C4A`, primary-hover `#174636`, accent `#A0703F` (small highlights only), whatsapp `#1EA952`. No crimson, no "Klyron" anywhere.
- Fonts: Inter (body/UI), Fraunces (headings) via `next/font/google`. Light theme only.
- Prices: integer PKR, shown `Rs. 125,000`; null → "Price on request".
- No `Review`/`AggregateRating` schema; `Product` schema only for non-sample products and `offers` only when price is set.
- Env vars: `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, `SESSION_SECRET` (≥32 chars), `SITE_URL` (fallback `https://$VERCEL_PROJECT_PRODUCTION_URL`, then `http://localhost:3000`). Never log or print their values.
- Product categories (fixed): Living Room, Bedroom, Dining, Office, Wardrobes, Kitchen, Outdoor, Kids.
- Images: JPG/PNG/WebP, ≤ 8 MB, ≤ 8 per product, alt text required.

## Review Focus
1. **Blob not configured** (`BLOB_READ_WRITE_TOKEN` missing): the upload control says "Image storage isn't connected yet" and the rest of the form still saves (with existing images). Test: `uploadTokenRoute` returns 503 with that message — Task 7.
2. **Session expires mid-edit:** the save returns `{ ok:false, reason:'unauthorized' }`, the form shows "You were signed out — sign in again in a new tab, then press Save", and the draft persists in `sessionStorage`. Test: `requireAdmin` returns null for an expired token — Task 4.
3. **Duplicate slug / title:** the save reports a field error "Another product already uses this web address", not a 500. Test: `uniqueSlug` appends `-2`, `-3` — Task 2.
4. **Phone typed in local formats** (`0300 1234567`, `+92-300-1234567`, `923001234567`): all normalise to `+923001234567`; landlines like `042 35761234` are accepted; junk is rejected. Test in Task 2.
5. **Unpublished or deleted product URL**, and the database being unreachable: the product page returns the 404 page; a DB outage on public pages renders `error.tsx` with call/WhatsApp buttons (from cached settings fallback defaults) instead of a blank page. Test: `getPublishedProductBySlug` returns null for unpublished — covered by manual check in Task 8.

---

### Task 1: Foundations — deps, tokens, fonts, layout shell, cleanup

**Files:**
- Modify: `package.json`, `next.config.ts`, `app/layout.tsx`, `app/globals.css`, `.gitignore`
- Create: `.env.example`, `lib/site-url.ts`
- Delete: `app/page.tsx` contents (replaced in Task 5), `public/*.svg`

**Interfaces:**
- Produces: Tailwind tokens `bg-ground bg-surface text-ink text-muted border-line bg-primary hover:bg-primary-hover text-accent bg-whatsapp`, `font-sans` (Inter), `font-display` (Fraunces); utility classes `.btn`, `.btn-primary`, `.btn-whatsapp`, `.btn-outline`, `.card`, `.input`, `.label`, `.container-page`.
- Produces: `getSiteUrl(): string` in `lib/site-url.ts`.

- [ ] **Step 1:** `npm i @neondatabase/serverless @vercel/blob bcryptjs jose lucide-react` and `npm i -D @types/bcryptjs`. Add scripts: `"test": "node --test lib/**/*.test.ts"`, `"db:setup": "node --env-file=.env scripts/db-setup.ts"`, `"create-admin": "node --env-file=.env scripts/create-admin.ts"`.
- [ ] **Step 2:** `next.config.ts`: keep existing options; add `images.remotePatterns` for `https://*.public.blob.vercel-storage.com`.
- [ ] **Step 3:** `globals.css`: remove dark-mode block; define the tokens above under `@theme`, and the utility classes. Buttons min-height 44px, focus ring 2px primary with 2px offset, `prefers-reduced-motion` disables transitions.
- [ ] **Step 4:** `layout.tsx`: Inter + Fraunces variables, `lang="en"`, `metadataBase: new URL(getSiteUrl())`, default title template `%s | Earth Interior`.
- [ ] **Step 5:** `.gitignore` includes `.env*` except `.env.example`; `.env.example` lists the four vars with comments.
- [ ] **Step 6:** Run `npm run build` → succeeds (placeholder page OK). Commit `chore: foundations for Earth Interior`.

### Task 2: Pure domain logic + tests

**Files:**
- Create: `lib/format.ts`, `lib/phone.ts`, `lib/slug.ts`, `lib/validate.ts`, `lib/whatsapp.ts`, `lib/types.ts`
- Test: `lib/format.test.ts`, `lib/phone.test.ts`, `lib/slug.test.ts`, `lib/validate.test.ts`

**Interfaces:**
- Produces (`lib/types.ts`): `ProductImage {url:string; alt:string; width:number; height:number}`, `Product {id:number; title:string; slug:string; category:Category; price:number|null; compareAtPrice:number|null; description:string; dimensions:string; features:string[]; images:ProductImage[]; sortOrder:number; published:boolean; isSample:boolean; updatedAt:string}`, `Settings {businessName; tagline; city; phone; whatsapp; addressStreet; addressArea; addressCity; mapUrl; hours; trustPoints:string[]; testimonials:{name;area;quote}[]; faqs:{q;a}[]}`, `Lead {id; name; phone; productId:number|null; productTitle:string|null; message; handled:boolean; createdAt:string}`, `CATEGORIES` const + `Category` type, `DEFAULT_SETTINGS: Settings`.
- Produces: `formatPKR(n:number|null):string`, `discountPercent(price, compareAt):number|null`; `normalizePkPhone(raw:string):string|null` (E.164); `slugify(title:string):string`, `uniqueSlug(base:string, taken:Set<string>):string`; `validateProduct(input:unknown):{ok:true; value:ProductInput}|{ok:false; errors:Record<string,string>}`, `validateLead(input)`, `validateSettings(input)` same shape; `whatsappLink(phoneE164:string, message:string):string`.
- Imports between lib files are relative with `.ts` extensions (needed by `node --test`); set `allowImportingTsExtensions: true` in tsconfig.

- [ ] **Step 1: Write failing tests**
```ts
// phone.test.ts
assert.equal(normalizePkPhone('0300 1234567'), '+923001234567');
assert.equal(normalizePkPhone('+92-300-1234567'), '+923001234567');
assert.equal(normalizePkPhone('923001234567'), '+923001234567');
assert.equal(normalizePkPhone('042 35761234'), '+924235761234');
assert.equal(normalizePkPhone('12345'), null);
assert.equal(normalizePkPhone('abc'), null);
// format.test.ts
assert.equal(formatPKR(125000), 'Rs. 125,000');
assert.equal(formatPKR(null), 'Price on request');
assert.equal(discountPercent(90000, 100000), 10);
assert.equal(discountPercent(100000, 90000), null);
// slug.test.ts
assert.equal(slugify('  Walnut Dining Table (6 Seater)! '), 'walnut-dining-table-6-seater');
assert.equal(slugify('!!!'), 'item');
assert.equal(uniqueSlug('sofa', new Set(['sofa','sofa-2'])), 'sofa-3');
// validate.test.ts
const r = validateProduct({ title:'', category:'Bedroom', price:'5000', compareAtPrice:'4000', images:[] });
assert.equal(r.ok, false);  // errors.title, errors.compareAtPrice ('must be higher than the price')
assert.equal(validateProduct({ title:'Bed', category:'Garage', images:[] }).ok, false); // bad category
assert.equal(validateProduct({ title:'Bed', category:'Bedroom', images:[{url:'https://x.public.blob.vercel-storage.com/a.webp', alt:'', width:1, height:1}] }).ok, false); // alt required
assert.equal(validateProduct({ title:'Bed', category:'Bedroom', price:'', images:[] }).ok, true); // price optional → null
assert.equal(validateLead({ name:'A', phone:'0300 1234567' }).ok, false); // name 2–80
assert.equal(validateLead({ name:'Ali', phone:'0300 1234567', website:'spam' }).ok, false); // honeypot
```
- [ ] **Step 2:** `npm test` → FAIL (modules missing).
- [ ] **Step 3:** Implement. Phone rule: strip non-digits; `0` + 10 digits → `92` + rest; `92` + 10–11 digits accepted; result `+` + digits. Image URLs must start with `https://` and host end with `.public.blob.vercel-storage.com`, or start with `/samples/`. Max 8 images; title ≤ 120; description ≤ 4000; features ≤ 20 lines; price 0 < n ≤ 100,000,000.
- [ ] **Step 4:** `npm test` → all PASS. Commit `feat: domain logic with tests`.

### Task 3: Neon schema, data layer, seed

**Files:**
- Create: `db/schema.sql`, `lib/db.ts`, `lib/data/products.ts`, `lib/data/settings.ts`, `lib/data/leads.ts`, `scripts/db-setup.ts`, `scripts/seed-data.ts`, `public/samples/*.webp`

**Interfaces:**
- Consumes: types from Task 2.
- Produces: `sql` (neon tagged template) from `lib/db.ts` (throws a clear "DATABASE_URL is not set" error).
- Produces (public, `'use cache'` + `cacheLife('hours')` + `cacheTag('products'|'settings')`): `getPublishedProducts():Promise<Product[]>`, `getPublishedProductBySlug(slug):Promise<Product|null>`, `getSettings():Promise<Settings>` (merges DB row over `DEFAULT_SETTINGS`).
- Produces (admin, uncached): `listAllProducts(filter:{q?:string; category?:string; status?:'all'|'published'|'hidden'})`, `getProductById(id)`, `createProduct(input)`, `updateProduct(id,input)`, `deleteProduct(id):Promise<ProductImage[]>` (returns images for Blob cleanup), `setPublished(id,bool)`, `moveProduct(id, dir:'up'|'down')`, `deleteSampleProducts():Promise<ProductImage[]>`, `countSampleProducts()`, `takenSlugs(excludeId?)`, `saveSettings(s)`, `createLead(input)`, `listLeads(filter:'open'|'handled'|'all')`, `countOpenLeads()`, `setLeadHandled(id,bool)`, `deleteLead(id)`; auth tables helpers live in Task 4.

- [ ] **Step 1:** `db/schema.sql` — tables per spec: `products` (+ `is_sample boolean default false`, index `(published, sort_order, id)`), `settings (id int primary key default 1 check (id=1), data jsonb)`, `leads` (`product_id` FK `on delete set null`, index `(handled, created_at desc)`), `admin_users`, `login_attempts (ip text, email text, succeeded bool, attempted_at timestamptz)`, `lead_attempts (ip text, attempted_at timestamptz)`. All `create table if not exists`.
- [ ] **Step 2:** Copy 8 of the old `../uploads/*-400|500|700|800.webp` largest variants into `public/samples/` with clean names; `scripts/seed-data.ts` holds 8 sample products (realistic Lahore copy, PKR prices on ~half, `is_sample: true`) referencing `/samples/...`.
- [ ] **Step 3:** `scripts/db-setup.ts`: run schema; insert `DEFAULT_SETTINGS` if no settings row; insert samples only if `products` is empty. Prints counts only.
- [ ] **Step 4 (needs owner):** run Neon setup per the Neon prompt: `npx neon@latest init` with project `plain-silence-55734952` and org `org-jolly-breeze-71327287` (after `neon login`), so `DATABASE_URL` lands in `.env`. If the agent is not permitted, stop and ask the owner to run it.
- [ ] **Step 5:** `npm run db:setup` → prints "products: 8, settings: 1"; run again → same counts (idempotent).
- [ ] **Step 6:** Commit `feat: neon schema, data layer and sample seed`.

### Task 4: Admin auth

**Files:**
- Create: `lib/auth/session.ts`, `lib/auth/password.ts`, `lib/auth/rate-limit.ts`, `lib/auth/require-admin.ts`, `proxy.ts`, `scripts/create-admin.ts`, `app/admin/login/page.tsx`, `app/admin/login/login-form.tsx`, `app/admin/actions/auth.ts`
- Test: `lib/auth/session.test.ts`

**Interfaces:**
- Produces: `signSession(p:{uid:number; email:string}, maxAgeSec:number):Promise<string>`, `verifySession(token:string):Promise<{uid;email}|null>` (jose HS256, `SESSION_SECRET`); cookie name `ei_admin`, httpOnly, SameSite=Lax, Secure in production, 12h.
- Produces: `requireAdmin():Promise<{uid;email}|null>` (reads cookie, verifies, confirms user row exists). Every admin page/action calls it; actions return `{ok:false, reason:'unauthorized'}` when null; pages `redirect('/admin/login?next=…')`.
- Produces: `loginAction(prev, formData)`, `logoutAction()`.
- Rate limit: 5 failures / 15 min per IP and per email; generic message "Email or password is incorrect"; locked message "Too many attempts. Try again in N minutes."; unknown email still runs bcrypt compare against a dummy hash.

- [ ] **Step 1: Failing test** — `verifySession(await signSession(p, 60))` deep-equals p; a token signed with `maxAgeSec=-1` → `null`; a tampered token → `null`; `SESSION_SECRET` shorter than 32 → `signSession` throws.
- [ ] **Step 2:** `npm test` → FAIL. **Step 3:** implement. **Step 4:** `npm test` → PASS.
- [ ] **Step 5:** `proxy.ts` matcher `/admin/:path*`, skip `/admin/login`; redirect to login when cookie missing/invalid (verify with jose only, no DB).
- [ ] **Step 6:** `scripts/create-admin.ts --email=…` prompts for the password twice (hidden input via `readline`), min 10 chars, upserts the user.
- [ ] **Step 7:** Login page: email + password, show/hide password toggle, pending state, errors inline, honours `?next=` (only same-origin `/admin` paths).
- [ ] **Step 8:** Commit `feat: admin authentication`.

### Task 5: Public site

**Files:**
- Create: `components/site/{Header,Footer,StickyContactBar,ContactButtons,Hero,TrustBar,CategoryGrid,ProductCard,HowItWorks,Testimonials,Faq,VisitUs,CallbackForm,JsonLd}.tsx`, `app/(site)/layout.tsx`, `app/(site)/page.tsx`, `app/(site)/furniture/page.tsx`, `app/(site)/furniture/[slug]/page.tsx`, `app/(site)/actions.ts`, `app/not-found.tsx`, `app/error.tsx`, `app/sitemap.ts`, `app/robots.ts`, `app/icon.svg`
- Delete: `app/page.tsx`

**Interfaces:**
- Consumes: `getSettings`, `getPublishedProducts`, `getPublishedProductBySlug`, `formatPKR`, `whatsappLink`, `validateLead`, `createLead`, `CATEGORIES`.
- Produces: `submitLead(prev, formData):Promise<{ok:boolean; message:string; errors?:Record<string,string>}>` — validates, honeypot `website`, rate limit 5/hour/IP via `lead_attempts`, `updateTag('leads')`.

- [ ] **Step 1: Layout** — Header (text wordmark "Earth Interior" from settings, nav: Furniture, How it works, Visit us; Call + WhatsApp buttons; mobile menu as `<details>`/dialog), Footer (NAP, hours, categories, map link), StickyContactBar on mobile (WhatsApp + Call, hidden ≥ md). `LocalBusiness`/`FurnitureStore` JSON-LD from settings.
- [ ] **Step 2: Home** — section order: Hero (H1 "Custom furniture made in {city}, built to your size"; WhatsApp + Call; 3 trust points), TrustBar, CategoryGrid (only categories with products, links `/furniture?category=`), Featured (first 8 published), HowItWorks (3 steps), Testimonials (from settings; hidden if empty), FAQ (`<details>` + `FAQPage` JSON-LD), VisitUs (address, hours, map link, CallbackForm).
- [ ] **Step 3: Catalog** `/furniture` — reads `searchParams` (`category`, `q`) inside `<Suspense>`; filter chips are links; search is a GET form; empty states: no products at all ("New pieces coming soon — WhatsApp us for custom designs"), no matches ("No match for 'x'" + clear filters link). Metadata title per category.
- [ ] **Step 4: Product page** `/furniture/[slug]` — `generateStaticParams` from published slugs; `notFound()` when null; gallery (thumbnail buttons, keyboard accessible), price/compare-at with % off, dimensions, features, description, WhatsApp prefilled `Hi, I'm interested in "{title}" – {url}`, Call, CallbackForm with productId, 4 related items same category; `generateMetadata` (title, description first 155 chars, OG image = cover); `Product` JSON-LD rules from Global Constraints; breadcrumbs.
- [ ] **Step 5: CallbackForm** (client): name, phone (`inputmode="tel"`, placeholder `0300 1234567`), optional message, hidden honeypot; `useActionState`; success state replaces form with "Thanks {name} — we'll call you within working hours" + WhatsApp shortcut; errors inline; button disabled while pending.
- [ ] **Step 6: SEO files** — `sitemap.ts` (home, `/furniture`, each category URL, each product with `lastModified`), `robots.ts` (disallow `/admin`, `/api`), `not-found.tsx` with links back + contact, `error.tsx` with retry + contact buttons using `DEFAULT_SETTINGS`.
- [ ] **Step 7:** `npm run build` passes; `npm run dev` and check `/`, `/furniture?category=Bedroom`, a product, a bad slug (404) in the browser at 375px and 1280px. Commit `feat: public site`.

### Task 6: Admin shell, products list, leads, settings

**Files:**
- Create: `app/admin/(panel)/layout.tsx`, `components/admin/{AdminNav,ConfirmButton,Toast,EmptyState,StatusBadge}.tsx`, `app/admin/(panel)/page.tsx` (overview), `app/admin/(panel)/products/page.tsx`, `app/admin/(panel)/leads/page.tsx`, `app/admin/(panel)/settings/page.tsx`, `app/admin/(panel)/settings/settings-form.tsx`, `app/admin/actions/products.ts`, `app/admin/actions/leads.ts`, `app/admin/actions/settings.ts`

**Interfaces:**
- Produces actions (all start with `requireAdmin()`, return `{ok:true}|{ok:false; reason:'unauthorized'|'invalid'|'error'; message:string; errors?}`, and call `updateTag('products')`/`'settings'`/`'leads'` as relevant): `togglePublished(id)`, `moveProductAction(id, dir)`, `deleteProductAction(id)` (deletes Blob images via `del()`, ignoring Blob errors after the DB delete succeeds), `removeSampleProducts()`, `markLeadHandled(id, handled)`, `deleteLeadAction(id)`, `saveSettingsAction(prev, formData)`.

- [ ] **Step 1:** Panel layout: sidebar on desktop / bottom tab bar on mobile (Overview, Products, Callback requests [unread badge from `countOpenLeads`], Settings, View site ↗, Sign out). Admin pages are dynamic; session reads sit inside `<Suspense>`. `robots: noindex`.
- [ ] **Step 2:** Overview: counts (published, hidden, open requests), newest 5 open requests with call/WhatsApp buttons, sample-products banner with confirmed "Remove sample products".
- [ ] **Step 3:** Products list: search + category + status filters via URL params, rows with thumbnail, title, category, price, status badge, up/down (disabled at ends), show/hide, edit, delete (confirm dialog naming the product; says photos are deleted too). Empty state "Add your first product". Optimistic toggles with toast on failure.
- [ ] **Step 4:** Leads inbox: tabs Open/Handled/All, each row: name, tap-to-call phone, WhatsApp link, product link, message, relative time; mark handled/undo; delete with confirm. Empty state.
- [ ] **Step 5:** Settings form: sections Business, Contact, Address & hours, Trust points (list editor), Testimonials (list editor, note "only add real customer quotes"), FAQ (list editor). Phone/WhatsApp normalised via `normalizePkPhone` with inline errors. Unsaved-changes `beforeunload` guard. Success toast.
- [ ] **Step 6:** Manual check in browser (signed in): every action incl. delete confirm, sample removal, settings change reflected on public header immediately. Commit `feat: admin panel`.

### Task 7: Product form + Blob uploads

**Files:**
- Create: `app/api/blob-upload/route.ts`, `components/admin/ImageManager.tsx`, `components/admin/ProductForm.tsx`, `app/admin/(panel)/products/new/page.tsx`, `app/admin/(panel)/products/[id]/page.tsx`, add `saveProductAction` to `app/admin/actions/products.ts`
- Test: `lib/upload-rules.test.ts` + `lib/upload-rules.ts`

**Interfaces:**
- Produces: `checkImageFile(f:{type:string; size:number}):string|null` (error text or null) in `lib/upload-rules.ts`; `saveProductAction(prev, formData)` (create/update, server-side `validateProduct`, `uniqueSlug` on create and when slug edited, field error on slug conflict, deletes Blob images removed from the product after a successful update, `updateTag('products')`, returns `{ok:true, id}`).
- `route.ts`: `handleUpload` from `@vercel/blob/client`; `onBeforeGenerateToken` calls `requireAdmin()` (401 otherwise), allows `image/jpeg,image/png,image/webp`, `maximumSizeInBytes: 8*1024*1024`, `addRandomSuffix: true`; returns 503 `{error:"Image storage isn't connected yet"}` when `BLOB_READ_WRITE_TOKEN` is unset.

- [ ] **Step 1: Failing test** — `checkImageFile({type:'image/gif', size:10})` → "Use a JPG, PNG or WebP photo"; `{type:'image/jpeg', size:9*1024*1024}` → "This photo is over 8 MB"; `{type:'image/webp', size:1000}` → null. **Step 2:** FAIL. **Step 3:** implement. **Step 4:** PASS.
- [ ] **Step 5:** ImageManager: drop zone + file picker (multiple, `accept` jpg/png/webp, `capture` off), per-file client check, `upload()` from `@vercel/blob/client` with progress bar, retry and remove on failure, reads natural width/height before upload, alt text input per image (required, pre-filled from title), reorder with up/down buttons + drag, "Cover" badge on first, limit 8 with message. Shows the 503 message permanently when storage isn't connected.
- [ ] **Step 6:** ProductForm: fields per spec; slug preview `/furniture/{slug}` auto from title until manually edited; price inputs accept `125,000` (strip commas); features one per line; published toggle; Save disabled while uploads in progress; field errors focus the first invalid field; `beforeunload` guard; draft mirrored to `sessionStorage` key `ei-draft-{id|new}` and offered for restore; unauthorized result shows the sign-in-again notice without clearing the form; after create redirect to edit page with toast "Saved".
- [ ] **Step 7:** Manual check: create, edit, change slug to a taken one (field error), remove image, cancel with unsaved changes (prompt). Commit `feat: product form with Blob uploads`.

### Task 8: Verify, README, Vercel prompt

**Files:**
- Create: `README.md` (replace), `docs/vercel-setup-prompt.md`

- [ ] **Step 1:** `npm test`, `npm run lint`, `npm run build` all pass.
- [ ] **Step 2:** Browser pass at 375px and 1280px: home, catalog filters/search/empty, product, 404, callback submit (success, invalid phone, honeypot), admin login (wrong password ×6 → lockout message), every admin flow, Review Focus items 1–5.
- [ ] **Step 3:** `grep -ri "klyron\|crimson\|B3122E" app components lib` → no matches.
- [ ] **Step 4:** README: local setup (neon init, db:setup, create-admin, dev), env vars, deploy via GitHub → Vercel, how to replace samples.
- [ ] **Step 5:** `docs/vercel-setup-prompt.md`: browser-agent prompt to (1) import the GitHub repo as a new Vercel project, (2) create a Blob store and connect it to the project for all environments, (3) add Neon (`DATABASE_URL`) via the Neon integration linked to project `plain-silence-55734952` or paste from the Neon console, (4) add `SESSION_SECRET` (generate 48 random chars) and optional `SITE_URL`, (5) redeploy and report the production URL — never printing secret values and stopping to ask before any paid plan or purchase.
- [ ] **Step 6:** Commit `docs: README and Vercel setup prompt`.
