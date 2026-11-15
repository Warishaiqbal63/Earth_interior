"use client";

import Image from "next/image";
import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, ImageOff, Pencil, Trash2 } from "lucide-react";
import { formatPKR } from "@/lib/format";
import type { Product } from "@/lib/types";
import { deleteProductAction, moveProductAction, togglePublishedAction } from "@/app/admin/actions/products";
import { ConfirmButton } from "./ConfirmButton";
import { runAction } from "./run-action";

type Props = { product: Product; isFirst: boolean; isLast: boolean; canReorder: boolean };

export function ProductRow({ product, isFirst, isLast, canReorder }: Props) {
  const [pending, start] = useTransition();
  const [published, setPublishedOptimistic] = useOptimistic(product.published);
  const cover = product.images[0];

  const toggle = () =>
    start(async () => {
      setPublishedOptimistic(!published);
      await runAction(
        () => togglePublishedAction(product.id, !published),
        !published ? `“${product.title}” is now on the website.` : `“${product.title}” is hidden from the website.`,
      );
    });

  const move = (dir: "up" | "down") => start(async () => void (await runAction(() => moveProductAction(product.id, dir))));

  return (
    <li className={`flex flex-wrap items-center gap-3 p-3 sm:flex-nowrap sm:gap-4 sm:p-4 ${pending ? "opacity-70" : ""}`}>
      <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-md bg-accent-soft sm:h-20 sm:w-16">
        {cover ? (
          <Image src={cover.url} alt="" fill sizes="64px" className="object-cover" />
        ) : (
          <ImageOff size={18} className="absolute inset-0 m-auto text-muted" aria-hidden />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <Link href={`/admin/products/${product.id}`} className="line-clamp-2 font-semibold hover:text-primary">
          {product.title}
        </Link>
        <p className="mt-0.5 text-sm text-muted">
          {product.category} · {formatPKR(product.price)}
        </p>
        <div className="mt-1 flex flex-wrap gap-1.5">
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              published ? "bg-primary-soft text-primary" : "bg-line text-muted"
            }`}
          >
            {published ? "On website" : "Hidden"}
          </span>
          {product.isSample && <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">Sample</span>}
          {!cover && <span className="rounded-full bg-danger-soft px-2 py-0.5 text-xs font-medium text-danger">No photo</span>}
        </div>
      </div>
      <div className="flex w-full shrink-0 items-center justify-end gap-1 border-t border-line pt-2 sm:w-auto sm:border-0 sm:pt-0">
        {canReorder && (
          <>
            <button type="button" className="btn btn-sm btn-ghost px-2" onClick={() => move("up")} disabled={isFirst || pending} aria-label={`Move ${product.title} up`}>
              <ArrowUp size={16} />
            </button>
            <button type="button" className="btn btn-sm btn-ghost px-2" onClick={() => move("down")} disabled={isLast || pending} aria-label={`Move ${product.title} down`}>
              <ArrowDown size={16} />
            </button>
          </>
        )}
        <button
          type="button"
          className="btn btn-sm btn-ghost px-2"
          onClick={toggle}
          disabled={pending}
          aria-label={published ? `Hide ${product.title} from website` : `Show ${product.title} on website`}
          title={published ? "Hide from website" : "Show on website"}
        >
          {published ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
        <Link href={`/admin/products/${product.id}`} className="btn btn-sm btn-ghost px-2" aria-label={`Edit ${product.title}`} title="Edit">
          <Pencil size={16} />
        </Link>
        <ConfirmButton
          className="btn btn-sm btn-ghost px-2 hover:!bg-danger-soft hover:!text-danger"
          label={`Delete ${product.title}`}
          title="Delete this product?"
          body={
            <>
              <strong className="text-ink">{product.title}</strong> and its photos will be removed permanently. To take it
              off the website but keep it, use Hide instead.
            </>
          }
          confirmText="Delete"
          onConfirm={() => runAction(() => deleteProductAction(product.id), "Product deleted.")}
        >
          <Trash2 size={16} />
        </ConfirmButton>
      </div>
    </li>
  );
}
