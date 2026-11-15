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
import { PortfolioGallery } from "@/components/site/Portfolio";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: { absolute: `${s.businessName} | Custom Furniture, Kitchens and Interiors in ${s.city}` },
    description: `Custom sofas, beds, wardrobes, dining sets, kitchens and wooden ceilings in ${s.city}, made to your size and budget. Kitchens installed in 10 to 15 days. Call or WhatsApp ${s.businessName}.`,
    alternates: { canonical: "/" },
    openGraph: { type: "website", siteName: s.businessName, title: `${s.businessName} | Custom Furniture and Interiors in ${s.city}`, images: [{ url: "/portfolio/curved-three-seater-sofa.webp", width: 1600, height: 1200 }] },
  };
}

export default async function HomePage() {
  const [settings, products] = await Promise.all([getSettings(), getPublishedProducts()]);
  const featured = products.slice(0, 8);

  return (
    <>
      <Hero settings={settings} />
      <TrustBar />

      <section id="our-work" className="container-page scroll-mt-28 py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Our work</p>
            <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Projects we have completed in {settings.city}</h2>
            <p className="mt-2 max-w-2xl text-muted">Sofas, chairs, kitchens and ceilings: finished projects, work in progress and the 3D designs we share before we start.</p>
          </div>
          <Link href="/portfolio" className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline sm:flex">
            See all <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
        <div className="mt-8">
          <PortfolioGallery limit={9} />
        </div>
        <div className="mt-4 text-center sm:hidden">
          <Link href="/portfolio" className="btn btn-outline">See all our work <ArrowRight size={18} aria-hidden /></Link>
        </div>
      </section>

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
