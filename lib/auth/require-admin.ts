import "server-only";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { db } from "@/lib/db";
import { SESSION_COOKIE, verifySession, type SessionPayload } from "./session";

/** The signed-in admin, or null. Confirms the account still exists, so a deleted admin loses access at once. */
export async function requireAdmin(): Promise<SessionPayload | null> {
  await connection(); // session checks depend on the current time, so always run per request
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);
  if (!session) return null;
  const rows = await db()`SELECT id FROM admin_users WHERE id = ${session.uid} AND email = ${session.email}`;
  return rows.length ? session : null;
}

export const UNAUTHORIZED = {
  ok: false as const,
  reason: "unauthorized" as const,
  message: "You were signed out. Sign in again in a new tab, then try again. Your changes are still here.",
};
