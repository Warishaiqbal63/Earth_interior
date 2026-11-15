import "server-only";
import { del } from "@vercel/blob";
import type { ProductImage } from "@/lib/types";

export function blobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/**
 * Removes uploaded photos from Blob storage. Sample photos in /public are skipped.
 * Never throws: the database change has already succeeded, and an orphaned file
 * costs a few kilobytes, while failing here would confuse the person using the admin.
 */
export async function deleteBlobImages(images: ProductImage[]): Promise<void> {
  const urls = images.map((i) => i.url).filter((u) => u.startsWith("https://"));
  if (!urls.length || !blobConfigured()) return;
  try {
    await del(urls);
  } catch (error) {
    console.error("Could not delete some photos from Blob storage", error);
  }
}
