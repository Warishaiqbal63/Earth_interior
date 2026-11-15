import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/data/settings";
import { PortfolioGallery } from "@/components/site/Portfolio";
import { ContactButtons } from "@/components/site/ContactButtons";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: `Our Work: Furniture and Interiors in ${s.city}`,
    description: `Photos and videos of furniture, kitchens and interiors by ${s.businessName} in ${s.city}: finished projects, installations in progress and 3D designs.`,
    alternates: { canonical: "/portfolio" },
  };
}

export default async function PortfolioPage() {
  const settings = await getSettings();
  return (
    <div className="container-page py-10 sm:py-14">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/" className="hover:text-primary">Home</Link> <span aria-hidden>/</span> <span className="text-ink">Our work</span>
      </nav>
      <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Our work</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Real furniture, kitchens and interiors we've designed and installed in {settings.city}, including work in progress and the 3D
        designs we share before anything is built.
      </p>
      <div className="mt-8">
        <PortfolioGallery />
      </div>
      <div className="card mt-12 flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <h2 className="text-2xl font-semibold">Want something like this?</h2>
          <p className="mt-1 text-muted">Send us a photo of your space and we'll share a design and price.</p>
        </div>
        <ContactButtons settings={settings} message={`Hi ${settings.businessName}, I saw your work on the website and I'd like a quote.`} />
      </div>
    </div>
  );
}
