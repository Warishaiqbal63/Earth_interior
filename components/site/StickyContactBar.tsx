import { MessageCircle, Phone } from "lucide-react";
import { whatsappLink } from "@/lib/whatsapp";
import type { Settings } from "@/lib/types";

/** Always-visible contact bar on phones, where the header buttons are tucked away. */
export function StickyContactBar({ settings }: { settings: Settings }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 p-3 backdrop-blur md:hidden">
      <div className="grid grid-cols-2 gap-3">
        <a href={`tel:${settings.phone}`} className="btn btn-outline">
          <Phone size={18} aria-hidden /> Call
        </a>
        <a
          href={whatsappLink(settings.whatsapp, `Hi ${settings.businessName}, I'd like to ask about custom furniture.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-whatsapp"
        >
          <MessageCircle size={18} aria-hidden /> WhatsApp
        </a>
      </div>
    </div>
  );
}
