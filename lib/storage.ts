import "server-only";
import { DeleteObjectsCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { IMAGE_BUCKET } from "@/lib/validate";
import type { ProductImage } from "@/lib/types";

/**
 * Neon Object Storage (S3-compatible). Credentials, endpoint and region come from the
 * standard AWS_* variables that `neon deploy` / `neon env pull` write.
 */
let client: S3Client | null = null;

export function storageConfigured(): boolean {
  return Boolean(process.env.AWS_ENDPOINT_URL_S3 && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
}

function s3(): S3Client {
  client ??= new S3Client({ forcePathStyle: true }); // Neon requires path-style addressing
  return client;
}

function publicUrl(key: string): string {
  return `${process.env.AWS_ENDPOINT_URL_S3!.replace(/\/+$/, "")}/${IMAGE_BUCKET}/${key}`;
}

function keyFromUrl(url: string): string | null {
  const endpoint = process.env.AWS_ENDPOINT_URL_S3;
  if (!endpoint) return null;
  const prefix = `${endpoint.replace(/\/+$/, "")}/${IMAGE_BUCKET}/`;
  return url.startsWith(prefix) ? decodeURIComponent(url.slice(prefix.length)) : null;
}

/** Stores a product photo under a new random key (never overwritten, so it can be cached forever). */
export async function putProductImage(body: Uint8Array, contentType: string, ext: string): Promise<string> {
  const key = `products/${crypto.randomUUID()}.${ext}`;
  await s3().send(
    new PutObjectCommand({
      Bucket: IMAGE_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  return publicUrl(key);
}

/**
 * Removes stored photos. Sample photos in /public are skipped. Never throws: the database
 * change has already succeeded, and a leftover file costs a little space, while an error
 * here would only confuse the person using the admin.
 */
export async function deleteProductImages(images: ProductImage[]): Promise<void> {
  if (!storageConfigured()) return;
  const keys = images.map((i) => keyFromUrl(i.url)).filter((k): k is string => Boolean(k));
  if (!keys.length) return;
  try {
    await s3().send(
      new DeleteObjectsCommand({ Bucket: IMAGE_BUCKET, Delete: { Objects: keys.map((Key) => ({ Key })), Quiet: true } }),
    );
  } catch (error) {
    console.error("Could not delete some photos from storage", error);
  }
}
