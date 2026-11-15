"use client";

import { useEffect, useId, useMemo, useState, useSyncExternalStore, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ExternalLink, Loader2 } from "lucide-react";
import { saveProductAction } from "@/app/admin/actions/products";
import { CATEGORIES, type Product } from "@/lib/types";
import { slugify } from "@/lib/slug";
import { discountPercent } from "@/lib/format";
import { ImageManager, type ImageItem } from "./ImageManager";
import { toast } from "./Toast";
import { useUnsavedWarning } from "./use-unsaved";

type FormState = {
  title: string;
  slug: string;
  slugTouched: boolean;
  category: string;
  price: string;
  compareAtPrice: string;
  dimensions: string;
  features: string;
  description: string;
  published: boolean;
  images: ImageItem[];
  /** updatedAt of the version this form was opened from; the server rejects saves over newer edits. */
  loadedAt: string;
};

function fromProduct(p: Product | null): FormState {
  return {
    title: p?.title ?? "",
    slug: p?.slug ?? "",
    slugTouched: Boolean(p),
    loadedAt: p?.updatedAt ?? "",
    category: p?.category ?? "",
    price: p?.price ? String(p.price) : "",
    compareAtPrice: p?.compareAtPrice ? String(p.compareAtPrice) : "",
    dimensions: p?.dimensions ?? "",
    features: p?.features.join("\n") ?? "",
    description: p?.description ?? "",
    published: p?.published ?? true,
    images: (p?.images ?? []).map((img) => ({ ...img, key: img.url, status: "done" as const })),
  };
}

/** Comparable snapshot: ignores transient upload fields. */
const snapshot = (f: FormState) =>
  JSON.stringify({ ...f, slugTouched: undefined, loadedAt: undefined, images: f.images.map(({ url, alt }) => ({ url, alt })) });

const noopSubscribe = () => () => {};
function readDraft(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null; // storage unavailable: drafts are a convenience only
  }
}

const toNumber = (s: string) => {
  const n = Number(s.replace(/[,\s]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
};

export function ProductForm({ product, storageReady }: { product: Product | null; storageReady: boolean }) {
  const router = useRouter();
  // Unique per form instance: Next keeps visited pages mounted (hidden), so fixed ids would repeat.
  const uid = useId();
  const fid = (name: string) => uid + "f-" + name;
  const draftKey = `ei-draft-${product?.id ?? "new"}`;
  const initial = useMemo(() => fromProduct(product), [product]);
  const [form, setForm] = useState<FormState>(initial);
  const [saved, setSaved] = useState(() => snapshot(initial));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [signedOut, setSignedOut] = useState(false);
  const [draftDismissed, setDraftDismissed] = useState(false);
  const [pending, start] = useTransition();

  const dirty = snapshot(form) !== saved;
  const uploading = form.images.some((i) => i.status === "uploading");
  const failed = form.images.some((i) => i.status === "error");
  useUnsavedWarning(dirty);

  // Offer to restore a draft left behind by a closed tab or an expired session.
  // Read once on the client (null during server render), and only when it differs from what's saved.
  const storedDraft = useSyncExternalStore(
    noopSubscribe,
    () => readDraft(draftKey),
    () => null,
  );
  const draft = useMemo(() => {
    if (draftDismissed || !storedDraft) return null;
    try {
      const d = JSON.parse(storedDraft) as FormState;
      return snapshot(d) !== snapshot(initial) ? d : null;
    } catch {
      return null;
    }
  }, [storedDraft, draftDismissed, initial]);

  useEffect(() => {
    if (!dirty) return;
    try {
      const keep = {
        ...form,
        images: form.images
          .filter((i) => i.status === "done")
          .map(({ key, url, alt, width, height, status }) => ({ key, url, alt, width, height, status })),
      };
      sessionStorage.setItem(draftKey, JSON.stringify(keep));
    } catch {
      /* ignore */
    }
  }, [form, dirty, draftKey]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === "title" && !f.slugTouched) next.slug = slugify(String(value));
      return next;
    });

  const off = discountPercent(toNumber(form.price), toNumber(form.compareAtPrice));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (uploading) return;
    start(async () => {
      try {
        const res = await saveProductAction(product?.id ?? null, {
          title: form.title,
          slug: form.slug,
          category: form.category,
          price: form.price,
          compareAtPrice: form.compareAtPrice,
          dimensions: form.dimensions,
          features: form.features,
          description: form.description,
          published: form.published,
          loadedAt: form.loadedAt,
          images: form.images.filter((i) => i.status === "done").map(({ url, alt, width, height }) => ({ url, alt, width, height })),
        });
        if (res.ok) {
          setErrors({});
          setSignedOut(false);
          const after = { ...form, slug: res.slug, loadedAt: res.updatedAt ?? form.loadedAt, images: form.images.filter((i) => i.status === "done") };
          setForm(after);
          setSaved(snapshot(after));
          try {
            sessionStorage.removeItem(draftKey);
          } catch {}
          toast(product ? "Changes saved." : "Product added.");
          if (!product) router.replace(`/admin/products/${res.id}`);
          return;
        }
        if (res.reason === "unauthorized") setSignedOut(true);
        setErrors(res.errors ?? {});
        toast(res.message, "error");
        const first = res.errors && Object.keys(res.errors)[0];
        if (first) document.getElementById(fid(first.startsWith("images") ? "images" : first))?.focus();
      } catch {
        toast("Couldn't reach the server. Check your connection; your changes are still here.", "error");
      }
    });
  }

  const err = (k: string) => errors[k] && <p className="field-error">{errors[k]}</p>;

  return (
    <form onSubmit={submit} noValidate className="mt-6 space-y-6">
      {draft && (
        <div className="flex flex-col gap-3 rounded-xl border border-accent/40 bg-accent-soft p-4 text-sm sm:flex-row sm:items-center">
          <p className="flex-1">You have unsaved changes from earlier on this product.</p>
          <div className="flex gap-2">
            <button type="button" className="btn btn-sm btn-primary" onClick={() => { setForm(draft); setDraftDismissed(true); }}>
              Restore them
            </button>
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => { try { sessionStorage.removeItem(draftKey); } catch {} setDraftDismissed(true); }}>
              Discard
            </button>
          </div>
        </div>
      )}

      {signedOut && (
        <div role="alert" className="flex gap-3 rounded-xl border border-danger/30 bg-danger-soft p-4 text-sm">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-danger" aria-hidden />
          <p>
            You were signed out, so this wasn't saved. Your changes are still here.{" "}
            <a href="/admin/login" target="_blank" className="font-semibold underline">Sign in again in a new tab</a>, then
            come back and press Save.
          </p>
        </div>
      )}

      <section className="card space-y-4 p-5 sm:p-6">
        <h2 className="font-sans text-base font-semibold">Photos</h2>
        <div id={fid("images")} tabIndex={-1}>
          <ImageManager
            items={form.images}
            onChange={(update) => setForm((f) => ({ ...f, images: update(f.images) }))}
            defaultAlt={form.title}
            storageReady={storageReady}
            errors={errors}
          />
        </div>
      </section>

      <section className="card space-y-4 p-5 sm:p-6">
        <h2 className="font-sans text-base font-semibold">Details</h2>
        <div>
          <label htmlFor={fid("title")} className="label">Product name</label>
          <input id={fid("title")} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Walnut King Bed with Storage" aria-invalid={!!errors.title} className="input" />
          {err("title")}
        </div>
        <div>
          <label htmlFor={fid("slug")} className="label">Web address</label>
          <div className="flex items-center rounded-lg border border-line bg-ground pl-3 text-sm text-muted focus-within:border-primary">
            <span className="shrink-0">/furniture/</span>
            <input
              id={fid("slug")}
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value, slugTouched: true }))}
              onBlur={() => setForm((f) => ({ ...f, slug: f.slug ? slugify(f.slug) : slugify(f.title) }))}
              aria-invalid={!!errors.slug}
              className="min-h-11 w-full rounded-r-lg bg-surface px-2 text-base text-ink focus:outline-none"
            />
          </div>
          {errors.slug ? err("slug") : <p className="hint">Filled in from the name. Changing it later breaks old shared links.</p>}
        </div>
        <div>
          <label htmlFor={fid("category")} className="label">Category</label>
          <select id={fid("category")} value={form.category} onChange={(e) => set("category", e.target.value)} aria-invalid={!!errors.category} className="input">
            <option value="" disabled>Choose a category</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {err("category")}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={fid("price")} className="label">Price in rupees <span className="font-normal text-muted">(optional)</span></label>
            <input id={fid("price")} inputMode="numeric" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="125,000" aria-invalid={!!errors.price} className="input" />
            {errors.price ? err("price") : <p className="hint">Leave empty to show “Price on request”.</p>}
          </div>
          <div>
            <label htmlFor={fid("compareAtPrice")} className="label">Old price <span className="font-normal text-muted">(optional)</span></label>
            <input id={fid("compareAtPrice")} inputMode="numeric" value={form.compareAtPrice} onChange={(e) => set("compareAtPrice", e.target.value)} placeholder="150,000" aria-invalid={!!errors.compareAtPrice} className="input" />
            {errors.compareAtPrice ? err("compareAtPrice") : <p className="hint">{off ? `Shows as ${off}% off.` : "Only for a discount. Shown crossed out."}</p>}
          </div>
        </div>
        <div>
          <label htmlFor={fid("dimensions")} className="label">Size <span className="font-normal text-muted">(optional)</span></label>
          <input id={fid("dimensions")} value={form.dimensions} onChange={(e) => set("dimensions", e.target.value)} placeholder="e.g. 78 × 84 in, or Built to your wall size" className="input" />
        </div>
        <div>
          <label htmlFor={fid("features")} className="label">Key features <span className="font-normal text-muted">(one per line)</span></label>
          <textarea id={fid("features")} rows={4} value={form.features} onChange={(e) => set("features", e.target.value)} placeholder={"Solid sheesham wood\nHydraulic storage\nChoice of fabric"} aria-invalid={!!errors.features} className="input" />
          {err("features")}
        </div>
        <div>
          <label htmlFor={fid("description")} className="label">Description <span className="font-normal text-muted">(optional)</span></label>
          <textarea id={fid("description")} rows={5} value={form.description} onChange={(e) => set("description", e.target.value)} aria-invalid={!!errors.description} className="input" />
          {errors.description ? err("description") : <p className="hint">Mention the wood, finish and what can be customised. The first sentence appears in Google.</p>}
        </div>
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-line p-3">
          <input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} className="mt-1 h-5 w-5 accent-[var(--color-primary)]" />
          <span>
            <span className="font-medium">Show on website</span>
            <span className="block text-sm text-muted">Untick to keep it saved here but hidden from visitors.</span>
          </span>
        </label>
      </section>

      <div className="sticky bottom-16 z-20 flex flex-wrap items-center justify-end gap-3 rounded-xl border border-line bg-surface/95 p-3 shadow-sm backdrop-blur md:bottom-4">
        <span className="mr-auto text-sm text-muted">
          {uploading ? "Waiting for photos to finish uploading…" : failed ? "Some photos failed. Retry or remove them." : dirty ? "Unsaved changes" : "All changes saved"}
        </span>
        {product && product.published && (
          <Link href={`/furniture/${product.slug}`} target="_blank" className="btn btn-ghost">
            <ExternalLink size={16} aria-hidden /> View
          </Link>
        )}
        <button type="submit" className="btn btn-primary" disabled={pending || uploading || (!dirty && Boolean(product))}>
          {pending && <Loader2 size={18} className="animate-spin" aria-hidden />}
          {pending ? "Saving…" : product ? "Save changes" : "Add product"}
        </button>
      </div>
    </form>
  );
}
