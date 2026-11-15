# Vercel setup prompt for a browser agent

Before you start, you need:
- the Earth Interior code pushed to a GitHub repository (note its name), and
- your local `earth-interior/.env` open in an editor, because the agent will ask you to paste values from it.

Copy everything below the line into a browser agent that is signed in to your Vercel account.

---

You are helping me deploy a Next.js website to Vercel. I am signed in to Vercel in this browser.
Work only in my Vercel account, and follow these rules throughout:

- **Never type, print, read aloud or repeat any secret value** (database URLs, keys, secrets). When a
  value is needed, stop and ask me to paste it into the field myself, then continue once I say it's done.
- **Do not choose any paid plan, upgrade, trial or purchase.** If Vercel asks for payment or a plan
  change, stop and tell me.
- Do not change any existing project other than the one created here.

Steps:

1. Go to https://vercel.com/new. Import the GitHub repository named **[YOUR-REPO-NAME]**. If GitHub
   access needs approving, stop and let me approve it.
2. On the configure screen: Framework preset **Next.js**, root directory: the repository root (where
   `package.json` and `next.config.ts` are), and leave the build settings at their defaults.
3. Before deploying, open **Environment Variables** and create these keys for **Production** and
   **Preview**. For each one, type the key name, then ask me to paste the value:
   - `DATABASE_URL`
   - `SESSION_SECRET`
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_ENDPOINT_URL_S3`
   - `AWS_REGION`
   - `SITE_URL` (optional: only if I have a custom domain; skip it if I say so)
4. Click **Deploy** and wait for the build to finish. If it fails, open the build log and report the
   first error line to me without copying any secret values.
5. When it's live, open the production URL and check that:
   - the home page shows "Earth Interior" and furniture photos,
   - `/furniture` lists products,
   - `/admin/login` shows the sign-in page (do not try to sign in).
6. Report back: the project name, the production URL, whether each check passed, and any warnings
   Vercel showed.
