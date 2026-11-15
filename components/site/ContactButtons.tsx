import { MessageCircle, Phone } from "lucide-react";
import { displayPkPhone } from "@/lib/phone";
import { whatsappLink } from "@/lib/whatsapp";
import type { Settings } from "@/lib/types";

type Props = {
  settings: Settings;
  message?: string;
  size?: "md" | "sm";
  className?: string;
  showNumber?: boolean;
};

export function ContactButtons({ settings, message, size = "md", className = "", showNumber = false }: Props) {
  const text = message ?? `Hi ${settings.businessName}, I'd like to ask about custom furniture.`;
  const sm = size === "sm" ? "btn-sm" : "";
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      <a
        href={whatsappLink(settings.whatsapp, text)}
        target="_blank"
        rel="noopener noreferrer"
        className={`btn btn-whatsapp ${sm}`}
      >
        <MessageCircle size={18} aria-hidden />
        WhatsApp us
      </a>
      <a href={`tel:${settings.phone}`} className={`btn btn-outline ${sm}`}>
        <Phone size={18} aria-hidden />
        {showNumber ? displayPkPhone(settings.phone) : "Call now"}
      </a>
    </div>
  );
}
