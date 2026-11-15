import { test } from "node:test";
import assert from "node:assert/strict";
import { lockMinutes } from "./lockout.ts";

const now = Date.parse("2026-11-15T12:00:00Z");
const ago = (min: number) => new Date(now - min * 60_000).toISOString();

test("locks one IP+email pair after 5 failures, until 15 minutes after the last one", () => {
  assert.equal(lockMinutes({ pair: 4, ip: 4, email: 4, last: ago(1) }, now), 0);
  assert.equal(lockMinutes({ pair: 5, ip: 5, email: 5, last: ago(1) }, now), 14);
});

test("failures for the owner's email from other IPs don't lock the owner out quickly", () => {
  // 30 failures spread over many IPs: the owner's own IP has none.
  assert.equal(lockMinutes({ pair: 0, ip: 0, email: 30, last: ago(1) }, now), 0);
});

test("a flood against one email or from one IP still locks", () => {
  assert.equal(lockMinutes({ pair: 0, ip: 0, email: 50, last: ago(2) }, now), 13);
  assert.equal(lockMinutes({ pair: 0, ip: 20, email: 0, last: ago(2) }, now), 13);
});

test("never returns less than 1 minute while locked", () => {
  assert.equal(lockMinutes({ pair: 5, ip: 5, email: 5, last: ago(14.99) }, now), 1);
});
