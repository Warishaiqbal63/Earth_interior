import "server-only";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { lockMinutes, WINDOW_MINUTES } from "./lockout";


export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

/** Minutes until sign-in is allowed again for this IP or email; 0 when not locked. */
export async function loginLockMinutes(ip: string, email: string): Promise<number> {
  const rows = await db()`
    SELECT count(*) FILTER (WHERE ip = ${ip} AND email = ${email})::int AS pair,
           count(*) FILTER (WHERE ip = ${ip})::int AS by_ip,
           count(*) FILTER (WHERE email = ${email})::int AS by_email,
           max(attempted_at) AS last
    FROM login_attempts
    WHERE NOT succeeded AND attempted_at > now() - make_interval(mins => ${WINDOW_MINUTES})
      AND (ip = ${ip} OR email = ${email})`;
  const row = rows[0];
  if (!row) return 0;
  return lockMinutes({
    pair: Number(row.pair),
    ip: Number(row.by_ip),
    email: Number(row.by_email),
    last: row.last ? new Date(row.last as string).toISOString() : null,
  });
}

export async function recordLogin(ip: string, email: string, succeeded: boolean): Promise<void> {
  const sql = db();
  if (succeeded) {
    await sql`DELETE FROM login_attempts WHERE ip = ${ip} OR email = ${email}`;
  } else {
    await sql`INSERT INTO login_attempts (ip, email, succeeded) VALUES (${ip}, ${email}, FALSE)`;
  }
  await sql`DELETE FROM login_attempts WHERE attempted_at < now() - interval '30 days'`;
}
