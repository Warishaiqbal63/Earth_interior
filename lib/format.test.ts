import { test } from "node:test";
import assert from "node:assert/strict";
import { discountPercent, formatPKR } from "./format.ts";

test("formats rupees", () => {
  assert.equal(formatPKR(125000), "Rs. 125,000");
  assert.equal(formatPKR(null), "Price on request");
});

test("discount percent only when compare-at is higher", () => {
  assert.equal(discountPercent(90000, 100000), 10);
  assert.equal(discountPercent(100000, 90000), null);
  assert.equal(discountPercent(null, 90000), null);
});
