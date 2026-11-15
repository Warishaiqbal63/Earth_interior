import Link from "next/link";
import { getSettings } from "@/lib/data/settings";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ContactButtons } from "@/components/site/ContactButtons";

export default async function NotFound() {
  const settings = await getSettings();
  return (
    <>
      <Header settings={settings} />
      <main className="container-page flex-1 py-20 text-center">
        <p className="eyebrow">Page not found</p>
        <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">This page isn't here any more</h1>
        <p className="mx-auto mt-3 max-w-md text-muted">
          The design may have been removed or renamed. Browse the current furniture, or ask us directly. We can make it to
          order.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/furniture" className="btn btn-primary">See all furniture</Link>
          <Link href="/" className="btn btn-outline">Home</Link>
        </div>
        <ContactButtons settings={settings} size="sm" className="mt-6 justify-center" />
      </main>
      <Footer settings={settings} />
    </>
  );
}
