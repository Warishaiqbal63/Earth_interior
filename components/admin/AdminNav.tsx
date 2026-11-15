"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, Inbox, LayoutDashboard, LogOut, Package, Settings } from "lucide-react";
import { logoutAction } from "@/app/admin/actions/auth";

const ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/leads", label: "Requests", longLabel: "Callback requests", icon: Inbox, badge: true },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminNav({ openLeads, businessName, email }: { openLeads: number; businessName: string; email: string }) {
  const path = usePathname();
  const active = (href: string, exact?: boolean) => (exact ? path === href : path.startsWith(href));

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-line bg-surface md:flex">
        <div className="border-b border-line px-5 py-5">
          <p className="font-display text-lg font-semibold">{businessName}</p>
          <p className="text-xs text-muted">Admin</p>
        </div>
        <nav aria-label="Admin" className="flex-1 space-y-1 p-3">
          {ITEMS.map(({ href, label, longLabel, icon: Icon, exact, badge }) => (
            <Link
              key={href}
              href={href}
              aria-current={active(href, exact) ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                active(href, exact) ? "bg-primary-soft text-primary" : "text-muted hover:bg-ground hover:text-ink"
              }`}
            >
              <Icon size={18} aria-hidden />
              <span className="flex-1">{longLabel ?? label}</span>
              {badge && openLeads > 0 && (
                <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-white" aria-label={`${openLeads} open`}>
                  {openLeads}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="space-y-1 border-t border-line p-3 text-sm">
          <a href="/" target="_blank" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted hover:bg-ground hover:text-ink">
            <ExternalLink size={18} aria-hidden /> View website
          </a>
          <form action={logoutAction}>
            <button type="submit" className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-muted hover:bg-ground hover:text-ink">
              <LogOut size={18} aria-hidden /> Sign out
            </button>
          </form>
          <p className="truncate px-3 pt-1 text-xs text-muted" title={email}>{email}</p>
        </div>
      </aside>

      {/* Mobile top bar + bottom tabs */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-surface px-4 md:hidden">
        <p className="font-display font-semibold">{businessName} <span className="font-sans text-xs font-normal text-muted">Admin</span></p>
        <div className="flex items-center gap-1">
          <a href="/" target="_blank" className="btn btn-sm btn-ghost" aria-label="View website"><ExternalLink size={18} /></a>
          <form action={logoutAction}>
            <button type="submit" className="btn btn-sm btn-ghost" aria-label="Sign out"><LogOut size={18} /></button>
          </form>
        </div>
      </header>
      <nav aria-label="Admin" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-line bg-surface md:hidden">
        {ITEMS.map(({ href, label, icon: Icon, exact, badge }) => (
          <Link
            key={href}
            href={href}
            aria-current={active(href, exact) ? "page" : undefined}
            className={`relative flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
              active(href, exact) ? "text-primary" : "text-muted"
            }`}
          >
            <Icon size={20} aria-hidden />
            {label}
            {badge && openLeads > 0 && (
              <span className="absolute right-[22%] top-1 min-w-5 rounded-full bg-accent px-1 text-center text-[10px] font-semibold text-white">
                {openLeads}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </>
  );
}
