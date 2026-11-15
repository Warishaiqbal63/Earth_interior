import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/ProductForm";
import { getProductById } from "@/lib/data/products";
import { storageConfigured } from "@/lib/storage";

export const metadata: Metadata = { title: "Edit product" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const product = Number.isInteger(id) && id > 0 ? await getProductById(id) : null;

  if (!product) {
    return (
      <div className="card p-10 text-center">
        <p className="text-lg font-semibold">This product doesn't exist any more.</p>
        <p className="mt-1 text-muted">It may have been deleted, perhaps in another tab.</p>
        <Link href="/admin/products" className="btn btn-primary mt-5">Back to products</Link>
      </div>
    );
  }

  return (
    <>
      <Link href="/admin/products" className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary">
        <ArrowLeft size={16} aria-hidden /> Products
      </Link>
      <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Edit product</h1>
      {product.isSample && (
        <p className="mt-2 rounded-lg bg-accent-soft p-3 text-sm">
          This is a sample product. Saving changes turns it into one of your own, so it won't be removed with the samples.
        </p>
      )}
      <ProductForm key={product.updatedAt} product={product} storageReady={storageConfigured()} />
    </>
  );
}
