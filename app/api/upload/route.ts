import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { putProductImage, storageConfigured } from "@/lib/storage";
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from "@/lib/upload-rules";

const EXT: Record<string, string> = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png" };

/** First bytes of each allowed format, so a renamed file can't pass as an image. */
function looksLikeImage(b: Uint8Array, type: string): boolean {
  if (type === "image/jpeg") return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
  if (type === "image/png") return b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;
  if (type === "image/webp")
    return String.fromCharCode(...b.slice(0, 4)) === "RIFF" && String.fromCharCode(...b.slice(8, 12)) === "WEBP";
  return false;
}

/** Receives one (already shrunk) product photo from the admin and stores it in Neon Object Storage. */
export async function POST(request: Request): Promise<NextResponse> {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "You were signed out. Sign in again in a new tab, then retry." }, { status: 401 });
  }
  if (!storageConfigured()) {
    return NextResponse.json({ error: "Image storage isn't connected yet." }, { status: 503 });
  }

  let file: FormDataEntryValue | null;
  try {
    file = (await request.formData()).get("file");
  } catch {
    return NextResponse.json({ error: "The upload was incomplete. Try again." }, { status: 400 });
  }
  if (!(file instanceof File)) return NextResponse.json({ error: "No photo was sent." }, { status: 400 });
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Use a JPG, PNG or WebP photo." }, { status: 415 });
  }
  if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "This photo is too large even after shrinking. Try a different photo." }, { status: 413 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!looksLikeImage(bytes, file.type)) {
    return NextResponse.json({ error: "This file isn't a valid photo." }, { status: 415 });
  }

  try {
    const url = await putProductImage(bytes, file.type, EXT[file.type]);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Photo upload to storage failed", error);
    return NextResponse.json({ error: "Storage didn't accept the photo. Try again in a moment." }, { status: 502 });
  }
}
