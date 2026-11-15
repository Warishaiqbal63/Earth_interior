import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";
import { DEFAULT_SETTINGS, type Settings } from "@/lib/types";

/** Settings stored in the database, layered over the defaults so new fields always have a value. */
export async function getSettings(): Promise<Settings> {
  "use cache";
  cacheLife("hours");
  cacheTag("settings");
  return readSettings();
}

/** Uncached read for the admin form. */
export async function readSettings(): Promise<Settings> {
  const rows = await db()`SELECT data FROM settings WHERE id = 1`;
  const stored = (rows[0]?.data ?? {}) as Partial<Settings>;
  return { ...DEFAULT_SETTINGS, ...stored };
}

export async function saveSettings(s: Settings): Promise<void> {
  await db()`
    INSERT INTO settings (id, data) VALUES (1, ${JSON.stringify(s)}::jsonb)
    ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`;
}
