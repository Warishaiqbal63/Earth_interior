# Earth Interior

Website and admin panel for a made-to-order furniture workshop in Lahore. Visitors browse
designs and contact the workshop by WhatsApp, phone or a call-back form. There is no cart or
online payment.

| Part | Technology |
|------|------------|
| Site and admin | Next.js 16 (App Router, Cache Components), React 19, TypeScript, Tailwind CSS 4 |
| Database | Neon Postgres (`@neondatabase/serverless`) |
| Product photos | Neon Object Storage, public bucket `product-images` (S3 API) |
| Hosting | Vercel |

## Running it on your computer

Requirements: Node 22 or newer.

```bash
npm install
```

1. **Environment variables.** Copy `.env.example` to `.env` and fill it in:
   - `DATABASE_URL`: Neon console → project → **Connect** (pooled connection string).
   - `SESSION_SECRET`: any 32+ random characters. Generate one with
     `node -e "console.log(require('crypto').randomBytes(36).toString('base64url'))"`.
   - `AWS_*`: see **Photo storage** below. Without them the site works, but photo uploads are switched off.
2. **Create the tables and sample content.** This is safe to run again; it only seeds empty tables.
   ```bash
   npm run db:setup
   ```
3. **Create your admin login.** It asks for a password (at least 10 characters). Run it again to reset the password.
   ```bash
   npm run create-admin -- --email=you@example.com
   ```
4. **Start the site.**
   ```bash
   npm run dev
   ```
   The site runs at http://localhost:3000 and the admin at http://localhost:3000/admin.

Checks: `npm test` (unit tests), `npm run lint`, `npm run build`.

## Photo storage (Neon Object Storage)

The bucket is declared in [`neon.ts`](neon.ts) as `product-images` with `public_read` access, so
visitors can see photos and only the admin can upload. Uploads go browser → `/api/upload`
(admin only) → bucket. The browser first shrinks each photo to WebP, at most 2000 px on its longest side.

To create the bucket and get its keys, the Neon CLI needs to be signed in. The browser sign-in times
out after 60 seconds, so an API key is the reliable way:

1. In the Neon console go to **Account settings → API keys → Create**, then add it to `.env` as `NEON_API_KEY=...`.
2. Run:
   ```bash
   npx neon@latest link --org-id org-jolly-breeze-71327287 --project-id plain-silence-55734952
   npx neon@latest deploy
   ```
   `deploy` creates the bucket and writes `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`,
   `AWS_ENDPOINT_URL_S3` and `AWS_REGION` to your env file. If they land in `.env.local`, that's fine:
   Next.js reads both.

## Deploying to Vercel

1. Push this folder to a new GitHub repository.
2. In Vercel, import the repository as a new project (framework: Next.js, default settings).
3. Under **Settings → Environment Variables**, add for Production and Preview: `DATABASE_URL`,
   `SESSION_SECRET`, the four `AWS_*` values, and optionally `SITE_URL` (your domain, e.g.
   `https://earthinterior.pk`; without it the site uses its `.vercel.app` address).
4. Redeploy. Then open `/admin/login` on the live site and sign in.

`docs/vercel-setup-prompt.md` has a ready-made prompt you can give a browser agent to do steps 2 and 3.

## Using the admin

| Task | Where |
|------|-------|
| Add a product | Products → **Add product**. Only the name and category are required. |
| Hide without deleting | Eye icon on the product row. It stays in the admin but leaves the website. |
| Change the order on the website | Up and down arrows (clear any filters first). |
| Remove the starting samples | Overview → **Remove sample products**. Products you edited are kept. |
| Call-back requests | **Requests** tab. The badge shows how many are open; mark them done once you've called. |
| Phone, WhatsApp, address, hours, FAQ, testimonials | **Settings**. Changes go live as soon as you save. |

Testimonials: only add real quotes from real customers. They aren't sent to Google as review markup.

## How it fits together

- `app/(site)`: the public pages. Product and settings reads are cached (`'use cache'`, tags
  `products` / `settings`), and every admin change calls `updateTag`, so the site updates at once.
- `app/admin`: the admin. `proxy.ts` sends visitors without a session to the sign-in page, and every
  admin page and action checks the session again (`lib/auth/require-admin.ts`).
- `lib/validate.ts`: the rules for products, call-back requests and settings, with Pakistani phone
  number handling in `lib/phone.ts`. The tests sit next to them (`*.test.ts`).
- `db/schema.sql`: the tables. `scripts/`: database setup, sample data, admin creation.

Security: passwords are hashed with bcrypt; failed sign-ins are limited to 5 per 15 minutes per IP
and per email; the session is a signed, httpOnly cookie that lasts 12 hours. The call-back form has a
hidden spam trap and a limit of 5 requests per hour per IP. Uploads are checked for type, size and
real image content.
