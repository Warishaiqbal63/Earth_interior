import Link from "next/link";
import { Menu, MessageCircle, Phone, X } from "lucide-react";
import { displayPkPhone } from "@/lib/phone";
import { whatsappLink } from "@/lib/whatsapp";
import type { Settings } from "@/lib/types";

const NAV = [
  { href: "/portfolio", label: "Our work" },
  { href: "/furniture", label: "Designs" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#faq", label: "FAQ" },
  { href: "/#visit", label: "Visit us" },
];

export function Header({ settings }: { settings: Settings }) {
  const wa = whatsappLink(settings.whatsapp, `Hi ${settings.businessName}, I'd like to ask about custom furniture.`);
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ground/95 backdrop-blur supports-[backdrop-filter]:bg-ground/80">
      <div className="hidden bg-primary text-white sm:block">
        <div className="container-page flex h-9 items-center justify-between text-xs">
          <span>Made to order in {settings.city} · {settings.hours}</span>
          <a href={`tel:${settings.phone}`} className="font-medium hover:underline">
            Call {displayPkPhone(settings.phone)}
          </a>
        </div>
      </div>
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-baseline gap-2" aria-label={`${settings.businessName} home`}>
          <span className="font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            {settings.businessName}
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-md px-3 py-2 text-sm font-medium text-muted hover:text-primary">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <a href={`tel:${settings.phone}`} className="btn btn-sm btn-ghost">
            <Phone size={16} aria-hidden /> Call
          </a>
          <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-whatsapp">
            <MessageCircle size={16} aria-hidden /> WhatsApp
          </a>
        </div>

        <details className="group relative md:hidden">
          <summary
            className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-lg border border-line bg-surface [&::-webkit-details-marker]:hidden"
            aria-label="Open menu"
          >
            <Menu size={20} className="group-open:hidden" aria-hidden />
            <X size={20} className="hidden group-open:block" aria-hidden />
          </summary>
          <nav
            aria-label="Mobile"
            className="card absolute right-0 top-13 z-50 flex w-64 flex-col p-2 shadow-lg"
          >
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-md px-3 py-3 text-base font-medium hover:bg-primary-soft">
                {item.label}
              </Link>
            ))}
            <a href={`tel:${settings.phone}`} className="rounded-md px-3 py-3 text-base font-medium hover:bg-primary-soft">
              Call {displayPkPhone(settings.phone)}
            </a>
          </nav>
        </details>
      </div>
    </header>
  );
}
