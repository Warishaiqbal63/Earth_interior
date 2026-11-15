import { test } from "node:test";
import assert from "node:assert/strict";
import { checkImageFile, MAX_UPLOAD_BYTES } from "./upload-rules.ts";

test("accepts jpg/png/webp originals up to 20 MB (they are shrunk in the browser)", () => {
  assert.equal(checkImageFile({ type: "image/webp", size: 1000 }), null);
  assert.equal(checkImageFile({ type: "image/jpeg", size: 20 * 1024 * 1024 }), null);
  assert.equal(checkImageFile({ type: "image/png", size: 5 }), null);
});

test("rejects other types, oversize and empty files", () => {
  assert.equal(checkImageFile({ type: "image/gif", size: 10 }), "Use a JPG, PNG or WebP photo.");
  assert.equal(checkImageFile({ type: "image/jpeg", size: 21 * 1024 * 1024 }), "This photo is over 20 MB. Use a smaller copy.");
  assert.equal(checkImageFile({ type: "image/jpeg", size: 0 }), "This file is empty.");
});

test("server upload limit stays under Vercel's 4.5 MB request cap", () => {
  assert.ok(MAX_UPLOAD_BYTES < 4.5 * 1024 * 1024);
});
