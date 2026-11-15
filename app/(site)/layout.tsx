import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { StickyContactBar } from "@/components/site/StickyContactBar";
import { JsonLd } from "@/components/site/JsonLd";
import { getSettings } from "@/lib/data/settings";
import { businessJsonLd } from "@/lib/seo";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const settings = await getSettings();
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-3 focus:text-white"
      >
        Skip to content
      </a>
      <Header settings={settings} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer settings={settings} />
      <StickyContactBar settings={settings} />
      <JsonLd data={businessJsonLd(settings)} />
    </>
  );
}
