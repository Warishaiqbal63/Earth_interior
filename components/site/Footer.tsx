import Link from "next/link";
import { Clock, MapPin, MessageCircle, Phone } from "lucide-react";
import { CATEGORIES, type Settings } from "@/lib/types";
import { displayPkPhone } from "@/lib/phone";
import { whatsappLink } from "@/lib/whatsapp";

export function Footer({ settings }: { settings: Settings }) {
  const address = [settings.addressStreet, settings.addressArea, settings.addressCity].filter(Boolean).join(", ");
  return (
    <footer className="mt-auto border-t border-line bg-surface pb-24 md:pb-0">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <p className="font-display text-2xl font-semibold">{settings.businessName}</p>
          <p className="mt-2 max-w-sm text-muted">{settings.tagline}. Kitchens, wardrobes and custom furniture, designed and installed for homes in {settings.city}.</p>
          <ul className="mt-5 space-y-2 text-sm">
            <li className="flex gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden />
              <address className="not-italic">{address}</address>
            </li>
            <li className="flex gap-2">
              <Clock size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden />
              {settings.hours}
            </li>
            <li className="flex gap-2">
              <Phone size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden />
              <a href={`tel:${settings.phone}`} className="hover:text-primary hover:underline">
                {displayPkPhone(settings.phone)}
              </a>
              {settings.altPhone && (
                <>
                  {" · "}
                  <a href={`tel:${settings.altPhone}`} className="hover:text-primary hover:underline">
                    {displayPkPhone(settings.altPhone)}
                  </a>
                </>
              )}
            </li>
            <li className="flex gap-2">
              <MessageCircle size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden />
              <a
                href={whatsappLink(settings.whatsapp, `Hi ${settings.businessName}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary hover:underline"
              >
                WhatsApp {displayPkPhone(settings.whatsapp)}
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Furniture</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {CATEGORIES.map((c) => (
              <li key={c}>
                <Link href={`/furniture?category=${encodeURIComponent(c)}`} className="hover:text-primary">
                  {c}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Company</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li><Link href="/portfolio" className="hover:text-primary">Our work</Link></li>
            <li><Link href="/#how-it-works" className="hover:text-primary">How it works</Link></li>
            <li><Link href="/#faq" className="hover:text-primary">Questions</Link></li>
            <li><Link href="/#visit" className="hover:text-primary">Visit our office</Link></li>
            {settings.mapUrl && (
              <li>
                <a href={settings.mapUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                  Get directions
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="container-page py-5 text-xs text-muted">
          © {settings.businessName}, {settings.city}. Made-to-order furniture.
        </p>
      </div>
    </footer>
  );
}
