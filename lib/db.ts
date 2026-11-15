import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let client: NeonQueryFunction<false, false> | null = null;

/** Neon HTTP client, created on first use so builds without a database still import this file. */
export function db(): NeonQueryFunction<false, false> {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL is not set. Run `npx neon@latest init` (see README) or add it in Vercel.");
    }
    client = neon(url);
  }
  return client;
}
