import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/ProductForm";
import { blobConfigured } from "@/lib/blob";

export const metadata: Metadata = { title: "Add product" };

export default function NewProductPage() {
  return (
    <>
      <Link href="/admin/products" className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary">
        <ArrowLeft size={16} aria-hidden /> Products
      </Link>
      <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Add product</h1>
      <p className="mt-1 text-muted">Only the name and category are required. You can add photos and prices later.</p>
      <ProductForm product={null} blobReady={blobConfigured()} />
    </>
  );
}
