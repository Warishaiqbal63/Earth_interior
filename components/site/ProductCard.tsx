import Image from "next/image";
import Link from "next/link";
import { ImageOff } from "lucide-react";
import { discountPercent, formatPKR } from "@/lib/format";
import type { Product } from "@/lib/types";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const cover = product.images[0];
  const off = discountPercent(product.price, product.compareAtPrice);
  return (
    <Link
      href={`/furniture/${product.slug}`}
      className="group card flex flex-col overflow-hidden transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-accent-soft">
        {cover ? (
          <Image
            src={cover.url}
            alt={cover.alt}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">
            <ImageOff aria-hidden />
            <span className="sr-only">No photo yet</span>
          </div>
        )}
        {off && (
          <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-white">
            {off}% off
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">{product.category}</p>
        <h3 className="mt-1 line-clamp-2 font-sans text-base font-semibold leading-snug group-hover:text-primary">
          {product.title}
        </h3>
        <p className="mt-auto pt-3 text-sm">
          <span className={product.price ? "font-semibold text-ink" : "text-muted"}>{formatPKR(product.price)}</span>
          {off && <span className="ml-2 text-muted line-through">{formatPKR(product.compareAtPrice)}</span>}
        </p>
      </div>
    </Link>
  );
}
