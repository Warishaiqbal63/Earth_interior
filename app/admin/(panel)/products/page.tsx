import type { Metadata } from "next";
import Link from "next/link";
import { PackageOpen, Plus, Search } from "lucide-react";
import { listAllProducts } from "@/lib/data/products";
import { CATEGORIES } from "@/lib/types";
import { ProductRow } from "@/components/admin/ProductRow";

export const metadata: Metadata = { title: "Products" };

type SP = Promise<{ q?: string; category?: string; status?: string }>;

export default async function ProductsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 80);
  const category = (CATEGORIES as readonly string[]).includes(sp.category ?? "") ? sp.category! : "";
  const status = sp.status === "published" || sp.status === "hidden" ? sp.status : "all";
  const filtered = Boolean(q || category || status !== "all");
  const products = await listAllProducts({ q, category, status });

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold sm:text-3xl">Products</h1>
        <Link href="/admin/products/new" className="btn btn-primary">
          <Plus size={18} aria-hidden /> Add product
        </Link>
      </div>

      <form method="get" className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]" role="search">
        <div className="relative">
          <label htmlFor="q" className="sr-only">Search products</label>
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
          <input id="q" name="q" type="search" defaultValue={q} placeholder="Search by name" className="input pl-10" />
        </div>
        <label className="sr-only" htmlFor="category">Category</label>
        <select id="category" name="category" defaultValue={category} className="input sm:w-44">
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <label className="sr-only" htmlFor="status">Status</label>
        <select id="status" name="status" defaultValue={status} className="input sm:w-40">
          <option value="all">All</option>
          <option value="published">On website</option>
          <option value="hidden">Hidden</option>
        </select>
        <button type="submit" className="btn btn-outline">Filter</button>
      </form>

      {filtered && (
        <p className="mt-3 text-sm text-muted">
          Showing {products.length} filtered result{products.length === 1 ? "" : "s"}.{" "}
          <Link href="/admin/products" className="font-semibold text-primary hover:underline">Clear filters</Link>
          <span className="block sm:inline sm:ml-1">Clear filters to change the display order.</span>
        </p>
      )}

      {products.length ? (
        <ul className="card mt-4 divide-y divide-line">
          {products.map((p, i) => (
            <ProductRow key={p.id} product={p} isFirst={i === 0} isLast={i === products.length - 1} canReorder={!filtered} />
          ))}
        </ul>
      ) : (
        <div className="card mt-4 flex flex-col items-center p-12 text-center">
          <PackageOpen size={32} className="text-muted" aria-hidden />
          {filtered ? (
            <>
              <p className="mt-3 font-semibold">No products match these filters.</p>
              <Link href="/admin/products" className="btn btn-outline mt-4">Clear filters</Link>
            </>
          ) : (
            <>
              <p className="mt-3 font-semibold">You haven't added any products yet.</p>
              <p className="mt-1 text-sm text-muted">Add a photo, a name and a category. Everything else is optional.</p>
              <Link href="/admin/products/new" className="btn btn-primary mt-4">
                <Plus size={18} aria-hidden /> Add your first product
              </Link>
            </>
          )}
        </div>
      )}
    </>
  );
}
