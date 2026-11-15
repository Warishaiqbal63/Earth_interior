import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizePkPhone } from "./phone.ts";

test("normalizes Pakistani mobile and landline formats", () => {
  assert.equal(normalizePkPhone("0300 1234567"), "+923001234567");
  assert.equal(normalizePkPhone("+92-300-1234567"), "+923001234567");
  assert.equal(normalizePkPhone("923001234567"), "+923001234567");
  assert.equal(normalizePkPhone("0092 300 1234567"), "+923001234567");
  assert.equal(normalizePkPhone("042 35761234"), "+924235761234");
});

test("rejects junk", () => {
  assert.equal(normalizePkPhone("12345"), null);
  assert.equal(normalizePkPhone("abc"), null);
  assert.equal(normalizePkPhone(""), null);
  assert.equal(normalizePkPhone("+1 415 555 0100"), null);
});
