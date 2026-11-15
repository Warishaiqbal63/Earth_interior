"use server";

import { refresh, updateTag } from "next/cache";
import { requireAdmin, UNAUTHORIZED } from "@/lib/auth/require-admin";
import { NOT_FOUND, SERVER_ERROR, type ActionResult } from "@/lib/action-result";
import { deleteProductImages } from "@/lib/storage";
import { uniqueSlug } from "@/lib/slug";
import { validateProduct } from "@/lib/validate";
import {
  createProduct,
  deleteProduct,
  deleteSampleProducts,
  getProductById,
  moveProduct,
  setPublished,
  takenSlugs,
  updateProduct,
} from "@/lib/data/products";

function changed() {
  updateTag("products");
  refresh();
}

export async function togglePublishedAction(id: number, published: boolean): Promise<ActionResult> {
  if (!(await requireAdmin())) return UNAUTHORIZED;
  try {
    if (!(await setPublished(id, published))) return NOT_FOUND;
    changed();
    return { ok: true };
  } catch (e) {
    console.error(e);
    return SERVER_ERROR;
  }
}

export async function moveProductAction(id: number, dir: "up" | "down"): Promise<ActionResult> {
  if (!(await requireAdmin())) return UNAUTHORIZED;
  try {
    await moveProduct(id, dir);
    changed();
    return { ok: true };
  } catch (e) {
    console.error(e);
    return SERVER_ERROR;
  }
}

export async function deleteProductAction(id: number): Promise<ActionResult> {
  if (!(await requireAdmin())) return UNAUTHORIZED;
  try {
    const images = await deleteProduct(id);
    if (images === null) return NOT_FOUND;
    await deleteProductImages(images);
    changed();
    return { ok: true };
  } catch (e) {
    console.error(e);
    return SERVER_ERROR;
  }
}

export async function removeSampleProductsAction(): Promise<ActionResult<{ removed: number }>> {
  if (!(await requireAdmin())) return UNAUTHORIZED;
  try {
    const images = await deleteSampleProducts();
    await deleteProductImages(images);
    changed();
    return { ok: true, removed: images.length };
  } catch (e) {
    console.error(e);
    return SERVER_ERROR;
  }
}

/** Creates (no id) or updates a product. Input is the JSON the product form builds. */
export async function saveProductAction(id: number | null, input: unknown): Promise<ActionResult<{ id: number; slug: string; updatedAt: string | null }>> {
  if (!(await requireAdmin())) return UNAUTHORIZED;
  const result = validateProduct(input);
  if (!result.ok) {
    return { ok: false, reason: "invalid", message: "Please fix the highlighted fields.", errors: result.errors };
  }
  const value = result.value;
  try {
    const existing = id ? await getProductById(id) : null;
    if (id && !existing) return NOT_FOUND;

    const taken = await takenSlugs(id ?? undefined);
    const slugEdited = typeof (input as Record<string, unknown>)?.slug === "string" && existing?.slug !== value.slug;
    if (taken.has(value.slug)) {
      if (id && slugEdited) {
        return {
          ok: false,
          reason: "invalid",
          message: "Please fix the highlighted fields.",
          errors: { slug: "Another product already uses this web address. Change it slightly." },
        };
      }
      value.slug = uniqueSlug(value.slug, taken);
    }

    let savedId: number;
    let updatedAt: string | null = null;
    if (existing) {
      const loadedAt = String((input as Record<string, unknown>)?.loadedAt ?? "");
      const saved = await updateProduct(existing.id, value, loadedAt || existing.updatedAt);
      if (saved === null) return NOT_FOUND;
      if (saved === "conflict") {
        return {
          ok: false,
          reason: "conflict",
          message:
            "This product was changed in another tab since you opened it. Copy anything you need, then reload the page to see the latest version.",
        };
      }
      updatedAt = saved;
      savedId = existing.id;
      const kept = new Set(value.images.map((i) => i.url));
      await deleteProductImages(existing.images.filter((i) => !kept.has(i.url)));
    } else {
      savedId = await createProduct(value);
    }
    changed();
    return { ok: true, id: savedId, slug: value.slug, updatedAt };
  } catch (e) {
    console.error(e);
    if (String(e).includes("products_slug_key")) {
      return {
        ok: false,
        reason: "invalid",
        message: "Please fix the highlighted fields.",
        errors: { slug: "Another product already uses this web address. Change it slightly." },
      };
    }
    return SERVER_ERROR;
  }
}
