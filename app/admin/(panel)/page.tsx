import Link from "next/link";
import { ArrowRight, Inbox, Plus } from "lucide-react";
import { countOpenLeads, listLeads } from "@/lib/data/leads";
import { countSampleProducts, productCounts } from "@/lib/data/products";
import { blobConfigured } from "@/lib/blob";
import { LeadRow } from "@/components/admin/LeadRow";
import { RemoveSamplesButton } from "@/components/admin/RemoveSamplesButton";

export default async function OverviewPage() {
  const [counts, open, leads, samples] = await Promise.all([
    productCounts(),
    countOpenLeads(),
    listLeads("open", 5),
    countSampleProducts(),
  ]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold sm:text-3xl">Overview</h1>
        <Link href="/admin/products/new" className="btn btn-primary">
          <Plus size={18} aria-hidden /> Add product
        </Link>
      </div>

      {samples > 0 && (
        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-accent/30 bg-accent-soft p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">
            <strong>{samples} sample product{samples === 1 ? " is" : "s are"} showing on your website.</strong> Add your own
            products, then remove the samples. Editing a sample turns it into a real product.
          </p>
          <RemoveSamplesButton count={samples} />
        </div>
      )}

      {!blobConfigured() && (
        <div className="mt-4 rounded-xl border border-line bg-surface p-4 text-sm">
          <strong>Photo storage isn't connected yet.</strong> You can edit text and prices, but uploading photos needs Vercel
          Blob to be connected to this project (see the setup guide).
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="On the website" value={counts.published} href="/admin/products?status=published" />
        <Stat label="Hidden" value={counts.hidden} href="/admin/products?status=hidden" />
        <Stat label="Open callback requests" value={open} href="/admin/leads" highlight={open > 0} />
      </div>

      <section className="card mt-8">
        <div className="flex items-center justify-between border-b border-line p-4">
          <h2 className="font-sans text-base font-semibold">Newest callback requests</h2>
          <Link href="/admin/leads" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            All requests <ArrowRight size={14} aria-hidden />
          </Link>
        </div>
        {leads.length ? (
          <ul className="divide-y divide-line">
            {leads.map((l) => (
              <LeadRow key={l.id} lead={l} compact />
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center p-10 text-center text-muted">
            <Inbox size={28} aria-hidden />
            <p className="mt-2">No open requests. When a visitor asks for a call back, it shows up here.</p>
          </div>
        )}
      </section>
    </>
  );
}

function Stat({ label, value, href, highlight = false }: { label: string; value: number; href: string; highlight?: boolean }) {
  return (
    <Link href={href} className={`card block p-5 hover:border-primary ${highlight ? "border-accent" : ""}`}>
      <p className="text-sm text-muted">{label}</p>
      <p className={`mt-1 text-3xl font-semibold ${highlight ? "text-accent" : ""}`}>{value}</p>
    </Link>
  );
}
