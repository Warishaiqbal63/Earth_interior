import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Search, X } from "lucide-react";
import { getPublishedProducts } from "@/lib/data/products";
import { getSettings } from "@/lib/data/settings";
import { ProductCard } from "@/components/site/ProductCard";
import { ContactButtons } from "@/components/site/ContactButtons";
import { CATEGORIES, type Category } from "@/lib/types";

type SP = Promise<{ category?: string | string[]; q?: string | string[] }>;

function readParams(sp: Awaited<SP>) {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const cat = one(sp.category);
  return {
    category: (CATEGORIES as readonly string[]).includes(cat) ? (cat as Category) : null,
    q: one(sp.q).trim().slice(0, 80),
  };
}

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const [{ category }, s] = await Promise.all([searchParams.then(readParams), getSettings()]);
  const title = category ? `${category} Furniture in ${s.city}` : `Custom Furniture Catalog, ${s.city}`;
  return {
    title,
    description: category
      ? `Made-to-order ${category.toLowerCase()} furniture from ${s.businessName} in ${s.city}. Custom sizes, wood and fabric. Call or WhatsApp for a quote.`
      : `Browse sofas, beds, dining sets, wardrobes and office furniture made to order by ${s.businessName} in ${s.city}.`,
    alternates: { canonical: category ? `/furniture?category=${encodeURIComponent(category)}` : "/furniture" },
  };
}

export default function CatalogPage({ searchParams }: { searchParams: SP }) {
  return (
    <div className="container-page py-10 sm:py-14">
      <Suspense fallback={<CatalogSkeleton />}>
        <Catalog searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Catalog({ searchParams }: { searchParams: SP }) {
  const { category, q } = readParams(await searchParams);
  const [products, settings] = await Promise.all([getPublishedProducts(), getSettings()]);
  const needle = q.toLowerCase();
  const shown = products.filter(
    (p) =>
      (!category || p.category === category) &&
      (!needle || `${p.title} ${p.category} ${p.description}`.toLowerCase().includes(needle)),
  );
  const available = CATEGORIES.filter((c) => products.some((p) => p.category === c));
  const href = (c: string | null) => {
    const params = new URLSearchParams();
    if (c) params.set("category", c);
    if (q) params.set("q", q);
    const s = params.toString();
    return s ? `/furniture?${s}` : "/furniture";
  };

  return (
    <>
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/" className="hover:text-primary">Home</Link> <span aria-hidden>/</span>{" "}
        <span className="text-ink">{category ?? "Furniture"}</span>
      </nav>
      <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
        {category ? `${category} furniture` : "All furniture"}
      </h1>
      <p className="mt-2 max-w-2xl text-muted">
        Made to order in {settings.city}. Any design can be made in your size, wood and fabric.
      </p>

      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden" role="list">
          <FilterChip href={href(null)} active={!category} label="All" />
          {available.map((c) => (
            <FilterChip key={c} href={href(c)} active={category === c} label={c} />
          ))}
        </div>
        <form action="/furniture" method="get" role="search" className="relative w-full lg:w-72">
          {category && <input type="hidden" name="category" value={category} />}
          <label htmlFor="q" className="sr-only">Search furniture</label>
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
          <input id="q" name="q" type="search" defaultValue={q} placeholder="Search: bed, walnut, sofa…" className="input pl-10" />
        </form>
      </div>

      {q && (
        <p className="mt-4 text-sm text-muted">
          {shown.length} result{shown.length === 1 ? "" : "s"} for “{q}”{" "}
          <Link href={href(category)} className="ml-1 inline-flex items-center gap-1 font-semibold text-primary hover:underline">
            <X size={14} aria-hidden /> Clear search
          </Link>
        </p>
      )}

      {shown.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {shown.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={i < 4} />
          ))}
        </div>
      ) : (
        <div className="card mt-8 p-8 text-center">
          <p className="text-lg font-semibold">
            {products.length === 0 ? "New designs are coming soon." : "Nothing matches that yet."}
          </p>
          <p className="mt-1 text-muted">
            We make furniture to order, so send us a photo of what you want and we'll quote for it.
          </p>
          <ContactButtons settings={settings} className="mt-5 justify-center" />
          {products.length > 0 && (
            <Link href="/furniture" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
              See all furniture
            </Link>
          )}
        </div>
      )}
    </>
  );
}

function FilterChip({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      role="listitem"
      aria-current={active ? "page" : undefined}
      className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        active ? "border-primary bg-primary text-white" : "border-line bg-surface text-ink hover:border-primary hover:text-primary"
      }`}
    >
      {label}
    </Link>
  );
}

function CatalogSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading furniture">
      <div className="h-10 w-64 animate-pulse rounded bg-line" />
      <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="aspect-[4/5] animate-pulse rounded-xl bg-line" />
        ))}
      </div>
    </div>
  );
}
