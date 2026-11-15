import { test } from "node:test";
import assert from "node:assert/strict";
import { slugify, uniqueSlug } from "./slug.ts";

test("slugify", () => {
  assert.equal(slugify("  Walnut Dining Table (6 Seater)! "), "walnut-dining-table-6-seater");
  assert.equal(slugify("!!!"), "item");
});

test("uniqueSlug appends a counter", () => {
  assert.equal(uniqueSlug("sofa", new Set(["sofa", "sofa-2"])), "sofa-3");
  assert.equal(uniqueSlug("bed", new Set()), "bed");
});
