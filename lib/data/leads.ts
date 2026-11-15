import "server-only";
import { db } from "@/lib/db";
import type { Lead, LeadInput } from "@/lib/types";

function toLead(r: Record<string, unknown>): Lead {
  return {
    id: Number(r.id),
    name: String(r.name),
    phone: String(r.phone),
    productId: r.product_id === null ? null : Number(r.product_id),
    productTitle: (r.product_title as string | null) ?? null,
    productSlug: (r.product_slug as string | null) ?? null,
    message: String(r.message ?? ""),
    handled: Boolean(r.handled),
    createdAt: new Date(r.created_at as string).toISOString(),
  };
}

export async function createLead(input: LeadInput): Promise<void> {
  // A product id that no longer exists is stored as null rather than failing the visitor's request.
  await db()`
    INSERT INTO leads (name, phone, message, product_id)
    VALUES (${input.name}, ${input.phone}, ${input.message},
            (SELECT id FROM products WHERE id = ${input.productId}))`;
}

export async function listLeads(filter: "open" | "handled" | "all" = "open", limit = 200): Promise<Lead[]> {
  const rows = await db()`
    SELECT l.*, p.title AS product_title, p.slug AS product_slug
    FROM leads l LEFT JOIN products p ON p.id = l.product_id
    WHERE ${filter} = 'all' OR (${filter} = 'open' AND NOT l.handled) OR (${filter} = 'handled' AND l.handled)
    ORDER BY l.created_at DESC
    LIMIT ${limit}`;
  return rows.map(toLead);
}

export async function countOpenLeads(): Promise<number> {
  const rows = await db()`SELECT count(*)::int AS n FROM leads WHERE NOT handled`;
  return Number(rows[0].n);
}

export async function setLeadHandled(id: number, handled: boolean): Promise<boolean> {
  const rows = await db()`UPDATE leads SET handled = ${handled} WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}

export async function deleteLead(id: number): Promise<boolean> {
  const rows = await db()`DELETE FROM leads WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}

/** Records a callback-form submission and returns how many this IP made in the last hour (including this one). */
export async function recordLeadAttempt(ip: string): Promise<number> {
  const sql = db();
  await sql`DELETE FROM lead_attempts WHERE attempted_at < now() - interval '1 day'`;
  await sql`INSERT INTO lead_attempts (ip) VALUES (${ip})`;
  const rows = await sql`SELECT count(*)::int AS n FROM lead_attempts WHERE ip = ${ip} AND attempted_at > now() - interval '1 hour'`;
  return Number(rows[0].n);
}
