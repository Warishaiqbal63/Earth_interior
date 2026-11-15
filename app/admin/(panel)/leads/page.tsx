import type { Metadata } from "next";
import Link from "next/link";
import { Inbox } from "lucide-react";
import { listLeads } from "@/lib/data/leads";
import { LeadRow } from "@/components/admin/LeadRow";

export const metadata: Metadata = { title: "Callback requests" };

const TABS = [
  { key: "open", label: "Open" },
  { key: "handled", label: "Done" },
  { key: "all", label: "All" },
] as const;

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  const show = (await searchParams).show;
  const tab = show === "handled" || show === "all" ? show : "open";
  const leads = await listLeads(tab);

  return (
    <>
      <h1 className="text-2xl font-semibold sm:text-3xl">Callback requests</h1>
      <p className="mt-1 text-muted">People who asked you to call them back from the website. Call them, then mark as done.</p>

      <nav aria-label="Filter requests" className="mt-6 inline-flex rounded-lg border border-line bg-surface p-1">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.key === "open" ? "/admin/leads" : `/admin/leads?show=${t.key}`}
            aria-current={tab === t.key ? "page" : undefined}
            className={`rounded-md px-4 py-1.5 text-sm font-medium ${tab === t.key ? "bg-primary text-white" : "text-muted hover:text-ink"}`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {leads.length ? (
        <ul className="card mt-4 divide-y divide-line">
          {leads.map((l) => (
            <LeadRow key={l.id} lead={l} />
          ))}
        </ul>
      ) : (
        <div className="card mt-4 flex flex-col items-center p-12 text-center text-muted">
          <Inbox size={32} aria-hidden />
          <p className="mt-3">
            {tab === "open" ? "You're all caught up. No open requests." : tab === "handled" ? "Nothing marked as done yet." : "No requests yet."}
          </p>
        </div>
      )}
    </>
  );
}

// Admin pages always read live data; they block on the server instead of prerendering a shell.
export const instant = false;
