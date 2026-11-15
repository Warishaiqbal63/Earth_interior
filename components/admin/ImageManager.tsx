"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { upload } from "@vercel/blob/client";
import { AlertCircle, ArrowLeft, ArrowRight, ImagePlus, Loader2, RotateCw, Star, Trash2 } from "lucide-react";
import { checkImageFile } from "@/lib/upload-rules";
import { MAX_IMAGES } from "@/lib/validate";
import { slugify } from "@/lib/slug";
import type { ProductImage } from "@/lib/types";

export type ImageItem = ProductImage & {
  key: string;
  status: "done" | "uploading" | "error";
  progress?: number;
  error?: string;
  file?: File;
  preview?: string;
};

type Props = {
  items: ImageItem[];
  onChange: (update: (items: ImageItem[]) => ImageItem[]) => void;
  defaultAlt: string;
  blobReady: boolean;
  errors: Record<string, string>;
};

function readSize(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve({ width: 0, height: 0 });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

export function ImageManager({ items, onChange, defaultAlt, blobReady, errors }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const patch = (key: string, p: Partial<ImageItem>) => onChange((list) => list.map((i) => (i.key === key ? { ...i, ...p } : i)));

  async function send(item: ImageItem) {
    if (!item.file) return;
    patch(item.key, { status: "uploading", progress: 0, error: undefined });
    try {
      const ext = item.file.type.split("/")[1] === "jpeg" ? "jpg" : item.file.type.split("/")[1];
      const base = slugify(item.file.name.replace(/\.[^.]+$/, "")).slice(0, 40);
      const blob = await upload(`products/${base}.${ext}`, item.file, {
        access: "public",
        handleUploadUrl: "/api/blob-upload",
        contentType: item.file.type,
        onUploadProgress: ({ percentage }) => patch(item.key, { progress: Math.round(percentage) }),
      });
      patch(item.key, { status: "done", url: blob.url, progress: 100, file: undefined });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      patch(item.key, {
        status: "error",
        error: /signed out|401/i.test(msg)
          ? "You were signed out. Sign in again in a new tab, then retry."
          : "Upload failed. Check your connection and retry.",
      });
    }
  }

  async function addFiles(files: FileList | File[]) {
    setNotice(null);
    const list = Array.from(files);
    const room = MAX_IMAGES - items.length;
    if (room <= 0) {
      setNotice(`You can add up to ${MAX_IMAGES} photos. Remove one to add another.`);
      return;
    }
    if (list.length > room) setNotice(`Only the first ${room} photo${room === 1 ? "" : "s"} were added (limit ${MAX_IMAGES}).`);
    const rejected: string[] = [];
    const fresh: ImageItem[] = [];
    for (const file of list.slice(0, room)) {
      const problem = checkImageFile(file);
      if (problem) {
        rejected.push(`${file.name}: ${problem}`);
        continue;
      }
      const size = await readSize(file);
      fresh.push({
        key: crypto.randomUUID(),
        url: "",
        alt: defaultAlt,
        ...size,
        status: "uploading",
        progress: 0,
        file,
        preview: URL.createObjectURL(file),
      });
    }
    if (rejected.length) setNotice(rejected.join(" "));
    if (!fresh.length) return;
    onChange((l) => [...l, ...fresh]);
    fresh.forEach((item) => void send(item));
  }

  const move = (i: number, d: -1 | 1) =>
    onChange((l) => {
      const next = [...l];
      [next[i], next[i + d]] = [next[i + d], next[i]];
      return next;
    });

  return (
    <div>
      {!blobReady && (
        <p className="mb-3 flex gap-2 rounded-lg bg-accent-soft p-3 text-sm">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-accent" aria-hidden />
          Image storage isn't connected yet, so new photos can't be uploaded. Existing photos and all other fields still save
          normally.
        </p>
      )}

      {items.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {items.map((item, i) => (
            <li key={item.key} className="flex gap-3 rounded-lg border border-line bg-surface p-3">
              <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-md bg-accent-soft">
                {(item.preview || item.url) && (
                  <Image src={item.preview || item.url} alt="" fill sizes="80px" className="object-cover" unoptimized={!!item.preview} />
                )}
                {i === 0 && (
                  <span className="absolute left-1 top-1 flex items-center gap-0.5 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    <Star size={10} aria-hidden /> Cover
                  </span>
                )}
                {item.status === "uploading" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink/50 text-xs text-white">
                    <Loader2 size={18} className="animate-spin" aria-hidden />
                    {item.progress ?? 0}%
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <label htmlFor={`alt-${item.key}`} className="text-xs font-medium text-muted">
                  Photo description
                </label>
                <input
                  id={`alt-${item.key}`}
                  value={item.alt}
                  onChange={(e) => patch(item.key, { alt: e.target.value })}
                  placeholder="e.g. Walnut bed with grey headboard"
                  aria-invalid={!!errors[`images.${i}.alt`]}
                  className="input mt-1 min-h-9 py-1.5 text-sm"
                />
                {errors[`images.${i}.alt`] && <p className="field-error text-xs">{errors[`images.${i}.alt`]}</p>}
                {item.status === "error" && (
                  <p className="mt-1 flex items-center gap-2 text-xs text-danger">
                    {item.error}
                    <button type="button" onClick={() => send(item)} className="inline-flex items-center gap-1 font-semibold underline">
                      <RotateCw size={12} aria-hidden /> Retry
                    </button>
                  </p>
                )}
                <div className="mt-2 flex gap-1">
                  <button type="button" className="btn btn-sm btn-ghost px-2" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move photo earlier">
                    <ArrowLeft size={14} />
                  </button>
                  <button type="button" className="btn btn-sm btn-ghost px-2" disabled={i === items.length - 1} onClick={() => move(i, 1)} aria-label="Move photo later">
                    <ArrowRight size={14} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost ml-auto px-2 hover:!text-danger"
                    onClick={() => onChange((l) => l.filter((x) => x.key !== item.key))}
                    aria-label="Remove photo"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {items.length < MAX_IMAGES && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (blobReady) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (blobReady) void addFiles(e.dataTransfer.files);
          }}
          className={`mt-3 rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
            dragOver ? "border-primary bg-primary-soft" : "border-line bg-ground"
          } ${blobReady ? "" : "opacity-60"}`}
        >
          <ImagePlus size={28} className="mx-auto text-muted" aria-hidden />
          <p className="mt-2 text-sm">
            <button type="button" className="font-semibold text-primary hover:underline disabled:no-underline" disabled={!blobReady} onClick={() => input.current?.click()}>
              Choose photos
            </button>{" "}
            <span className="hidden sm:inline">or drag them here</span>
          </p>
          <p className="mt-1 text-xs text-muted">JPG, PNG or WebP, up to 8 MB each. {MAX_IMAGES - items.length} more allowed. The first photo is the cover.</p>
          <input
            ref={input}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            hidden
            onChange={(e) => {
              if (e.target.files) void addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      )}
      {(notice || errors.images) && <p className="field-error">{notice ?? errors.images}</p>}
    </div>
  );
}
