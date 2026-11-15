import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Ruler } from "lucide-react";
import { getPublishedProductBySlug, getPublishedProducts } from "@/lib/data/products";
import { getSettings } from "@/lib/data/settings";
import { Gallery } from "@/components/site/Gallery";
import { ContactButtons } from "@/components/site/ContactButtons";
import { CallbackForm } from "@/components/site/CallbackForm";
import { ProductCard } from "@/components/site/ProductCard";
import { JsonLd } from "@/components/site/JsonLd";
import { discountPercent, formatPKR } from "@/lib/format";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site-url";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const products = await getPublishedProducts();
  // Cache Components needs at least one entry; an unknown slug simply renders the 404 page.
  return products.length ? products.map((p) => ({ slug: p.slug })) : [{ slug: "coming-soon" }];
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const [p, s] = await Promise.all([getPublishedProductBySlug(slug), getSettings()]);
  if (!p) return { title: "Not found", robots: { index: false } };
  const description = (p.description || `${p.title}, made to order in ${s.city}.`).slice(0, 155);
  const cover = p.images[0];
  return {
    title: `${p.title} | ${p.category} Furniture ${s.city}`,
    description,
    alternates: { canonical: `/furniture/${p.slug}` },
    openGraph: {
      type: "website",
      title: p.title,
      description,
      images: cover ? [{ url: cover.url, width: cover.width || undefined, height: cover.height || undefined, alt: cover.alt }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [product, settings, all] = await Promise.all([
    getPublishedProductBySlug(slug),
    getSettings(),
    getPublishedProducts(),
  ]);
  if (!product) notFound();

  const off = discountPercent(product.price, product.compareAtPrice);
  const url = `${getSiteUrl()}/furniture/${product.slug}`;
  const related = all.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const ld = productJsonLd(product, settings);

  return (
    <div className="container-page py-8 sm:py-12">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/" className="hover:text-primary">Home</Link> <span aria-hidden>/</span>{" "}
        <Link href={`/furniture?category=${encodeURIComponent(product.category)}`} className="hover:text-primary">
          {product.category}
        </Link>{" "}
        <span aria-hidden>/</span> <span className="text-ink">{product.title}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <Gallery images={product.images} title={product.title} />

        <div>
          <p className="eyebrow">{product.category} · Made to order</p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl">{product.title}</h1>
          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <span className={`text-2xl font-semibold ${product.price ? "text-ink" : "text-muted"}`}>
              {product.price ? `From ${formatPKR(product.price)}` : formatPKR(null)}
            </span>
            {off && (
              <>
                <span className="text-muted line-through">{formatPKR(product.compareAtPrice)}</span>
                <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-white">{off}% off</span>
              </>
            )}
          </div>
          <p className="mt-2 text-sm text-muted">Final price depends on size, wood and fabric. You get a written quote first.</p>

          <ContactButtons
            settings={settings}
            message={`Hi ${settings.businessName}, I'm interested in "${product.title}". ${url}`}
            className="mt-6"
          />

          {product.dimensions && (
            <p className="mt-6 flex items-center gap-2 text-sm">
              <Ruler size={18} className="text-primary" aria-hidden />
              <span className="font-semibold">Size:</span> {product.dimensions}
            </p>
          )}

          {product.features.length > 0 && (
            <ul className="mt-6 space-y-2">
              {product.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <Check size={18} className="mt-0.5 shrink-0 text-primary" aria-hidden />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          )}

          {product.description && (
            <div className="mt-6 border-t border-line pt-6">
              <h2 className="font-sans text-base font-semibold">About this piece</h2>
              <p className="mt-2 whitespace-pre-line text-muted">{product.description}</p>
            </div>
          )}

          <ul className="mt-6 grid gap-2 rounded-xl bg-primary-soft p-4 text-sm sm:grid-cols-2">
            {settings.trustPoints.slice(0, 4).map((t) => (
              <li key={t} className="flex gap-2">
                <Check size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden /> {t}
              </li>
            ))}
          </ul>

          <div className="card mt-8 p-6">
            <h2 className="text-xl font-semibold">Ask about this piece</h2>
            <p className="mt-1 text-sm text-muted">Leave your number and we'll call you back with options and a price.</p>
            <CallbackForm className="mt-5" productId={product.id} productTitle={product.title} />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-semibold">More {product.category.toLowerCase()} designs</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {ld && <JsonLd data={ld} />}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: product.category, path: `/furniture?category=${encodeURIComponent(product.category)}` },
          { name: product.title, path: `/furniture/${product.slug}` },
        ])}
      />
    </div>
  );
}
