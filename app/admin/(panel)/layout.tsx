import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth/require-admin";
import { countOpenLeads } from "@/lib/data/leads";
import { readSettings } from "@/lib/data/settings";
import { AdminNav } from "@/components/admin/AdminNav";
import { Toaster } from "@/components/admin/Toast";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false },
};

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center gap-2 text-muted">
          <Loader2 className="animate-spin" size={20} aria-hidden /> Loading…
        </div>
      }
    >
      <Panel>{children}</Panel>
    </Suspense>
  );
}

async function Panel({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");
  const [openLeads, settings] = await Promise.all([countOpenLeads(), readSettings()]);
  return (
    <div className="flex flex-1 bg-ground md:min-h-dvh">
      <AdminNav openLeads={openLeads} businessName={settings.businessName} email={admin.email} />
      <div className="min-w-0 flex-1 pb-24 md:pb-10">
        <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 md:py-10">{children}</div>
      </div>
      <Toaster />
    </div>
  );
}
