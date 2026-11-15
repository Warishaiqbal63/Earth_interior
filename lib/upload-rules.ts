export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
/** Originals straight off a phone can be large; the browser shrinks them before upload. */
export const MAX_ORIGINAL_BYTES = 20 * 1024 * 1024;
/** What the server accepts after shrinking. Stays under Vercel's 4.5 MB request body limit. */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
/** Longest edge of the stored photo, in pixels. */
export const MAX_IMAGE_EDGE = 2000;

/** Returns an error message for a file that can't be used, or null when it's fine. */
export function checkImageFile(f: { type: string; size: number }): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(f.type)) return "Use a JPG, PNG or WebP photo.";
  if (f.size <= 0) return "This file is empty.";
  if (f.size > MAX_ORIGINAL_BYTES) return "This photo is over 20 MB. Use a smaller copy.";
  return null;
}
