import { test } from "node:test";
import assert from "node:assert/strict";
import { validateLead, validateProduct, validateSettings } from "./validate.ts";
import { DEFAULT_SETTINGS } from "./types.ts";

const img = { url: "https://abc.public.blob.vercel-storage.com/a.webp", alt: "Oak bed", width: 800, height: 600 };

test("product: required title, compare-at above price", () => {
  const r = validateProduct({ title: "", category: "Bedroom", price: "5000", compareAtPrice: "4000", images: [] });
  assert.equal(r.ok, false);
  if (!r.ok) {
    assert.ok(r.errors.title);
    assert.match(r.errors.compareAtPrice, /higher than the price/);
  }
});

test("product: bad category, missing alt, foreign image host", () => {
  assert.equal(validateProduct({ title: "Bed", category: "Garage", images: [] }).ok, false);
  assert.equal(validateProduct({ title: "Bed", category: "Bedroom", images: [{ ...img, alt: "" }] }).ok, false);
  assert.equal(validateProduct({ title: "Bed", category: "Bedroom", images: [{ ...img, url: "https://evil.com/a.webp" }] }).ok, false);
  assert.equal(validateProduct({ title: "Bed", category: "Bedroom", images: Array(9).fill(img) }).ok, false);
});

test("product: optional price, comma input, features split", () => {
  const r = validateProduct({ title: " Bed ", category: "Bedroom", price: "", images: [img], features: "Solid oak\n\n Storage " });
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.value.price, null);
    assert.equal(r.value.title, "Bed");
    assert.deepEqual(r.value.features, ["Solid oak", "Storage"]);
  }
  const c = validateProduct({ title: "Sofa", category: "Living Room", price: "125,000", images: [] });
  assert.equal(c.ok && c.value.price, 125000);
});

test("lead: name length, phone, honeypot", () => {
  assert.equal(validateLead({ name: "A", phone: "0300 1234567" }).ok, false);
  assert.equal(validateLead({ name: "Ali", phone: "0300 1234567", website: "spam" }).ok, false);
  assert.equal(validateLead({ name: "Ali", phone: "12" }).ok, false);
  const ok = validateLead({ name: "Ali Raza", phone: "0300 1234567", message: "", productId: "3" });
  assert.equal(ok.ok, true);
  if (ok.ok) {
    assert.equal(ok.value.phone, "+923001234567");
    assert.equal(ok.value.productId, 3);
  }
});

test("settings: phone normalized, required business name", () => {
  const ok = validateSettings({ ...DEFAULT_SETTINGS, phone: "0300 1234567", whatsapp: "0300-1234567" });
  assert.equal(ok.ok, true);
  if (ok.ok) assert.equal(ok.value.whatsapp, "+923001234567");
  assert.equal(validateSettings({ ...DEFAULT_SETTINGS, businessName: "" }).ok, false);
  assert.equal(validateSettings({ ...DEFAULT_SETTINGS, phone: "nope" }).ok, false);
});
