import { test } from "node:test";
import assert from "node:assert/strict";
import { checkImageFile } from "./upload-rules.ts";

test("accepts jpg/png/webp up to 8 MB", () => {
  assert.equal(checkImageFile({ type: "image/webp", size: 1000 }), null);
  assert.equal(checkImageFile({ type: "image/jpeg", size: 8 * 1024 * 1024 }), null);
  assert.equal(checkImageFile({ type: "image/png", size: 5 }), null);
});

test("rejects other types, oversize and empty files", () => {
  assert.equal(checkImageFile({ type: "image/gif", size: 10 }), "Use a JPG, PNG or WebP photo.");
  assert.equal(checkImageFile({ type: "image/heic", size: 10 }), "Use a JPG, PNG or WebP photo.");
  assert.equal(checkImageFile({ type: "image/jpeg", size: 9 * 1024 * 1024 }), "This photo is over 8 MB. Use a smaller copy.");
  assert.equal(checkImageFile({ type: "image/jpeg", size: 0 }), "This file is empty.");
});
