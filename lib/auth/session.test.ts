import { test } from "node:test";
import assert from "node:assert/strict";
import { signSession, verifySession } from "./session.ts";

const p = { uid: 7, email: "owner@example.com" };

test("round-trips a valid session", async () => {
  process.env.SESSION_SECRET = "x".repeat(40);
  assert.deepEqual(await verifySession(await signSession(p, 60)), p);
});

test("rejects expired and tampered tokens", async () => {
  process.env.SESSION_SECRET = "x".repeat(40);
  assert.equal(await verifySession(await signSession(p, -1)), null);
  const t = await signSession(p, 60);
  assert.equal(await verifySession(t.slice(0, -2) + (t.endsWith("A") ? "BB" : "AA")), null);
  assert.equal(await verifySession("garbage"), null);
  process.env.SESSION_SECRET = "y".repeat(40);
  assert.equal(await verifySession(t), null);
});

test("refuses a short secret", async () => {
  process.env.SESSION_SECRET = "short";
  await assert.rejects(() => signSession(p, 60), /SESSION_SECRET/);
});
