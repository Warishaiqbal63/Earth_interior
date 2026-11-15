export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

/** Returns an error message for a file that can't be uploaded, or null when it's fine. */
export function checkImageFile(f: { type: string; size: number }): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(f.type)) return "Use a JPG, PNG or WebP photo.";
  if (f.size <= 0) return "This file is empty.";
  if (f.size > MAX_IMAGE_BYTES) return "This photo is over 8 MB. Use a smaller copy.";
  return null;
}
