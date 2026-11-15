import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getPublishedProducts } from "@/lib/data/products";
import { getSettings } from "@/lib/data/settings";
import { ProductCard } from "@/components/site/ProductCard";
import { ContactButtons } from "@/components/site/ContactButtons";
import { JsonLd } from "@/components/site/JsonLd";
import { CategoryGrid, Faq, Hero, HowItWorks, Testimonials, TrustBar, VisitUs } from "@/components/site/HomeSections";
import { faqJsonLd } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: { absolute: `${s.businessName} | Custom Furniture Made in ${s.city}` },
    description: `Made-to-order sofas, beds, dining sets, wardrobes and office furniture from our ${s.city} workshop. Free home measurement and a written quote. Call or WhatsApp ${s.businessName}.`,
    alternates: { canonical: "/" },
    openGraph: { type: "website", siteName: s.businessName, title: `${s.businessName} | Custom Furniture in ${s.city}` },
  };
}

export default async function HomePage() {
  const [settings, products] = await Promise.all([getSettings(), getPublishedProducts()]);
  const featured = products.slice(0, 8);

  return (
    <>
      <Hero settings={settings} products={products} />
      <TrustBar />
      <CategoryGrid products={products} />

      <section className="container-page pb-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Recent work</p>
            <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Designs we can make for you</h2>
            <p className="mt-2 max-w-2xl text-muted">
              Every design can be changed: size, wood, polish and fabric. Prices are a starting point; your quote depends on
              what you choose.
            </p>
          </div>
        </div>
        {featured.length > 0 ? (
          <>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {featured.map((p, i) => (
                <ProductCard key={p.id} product={p} priority={i < 2} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="/furniture" className="btn btn-outline">
                See all furniture <ArrowRight size={18} aria-hidden />
              </Link>
            </div>
          </>
        ) : (
          <div className="card mt-8 p-8 text-center">
            <p className="text-lg font-semibold">New designs are being photographed.</p>
            <p className="mt-1 text-muted">Send us a picture of what you have in mind and we'll quote for it.</p>
            <ContactButtons settings={settings} className="mt-5 justify-center" />
          </div>
        )}
      </section>

      <HowItWorks />
      <Testimonials settings={settings} />
      <Faq settings={settings} />
      <VisitUs settings={settings} />
      {settings.faqs.length > 0 && <JsonLd data={faqJsonLd(settings)} />}
    </>
  );
}
