"use client";

import { MessageCircle, Phone, RotateCw } from "lucide-react";
import { DEFAULT_SETTINGS } from "@/lib/types";
import { whatsappLink } from "@/lib/whatsapp";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  const s = DEFAULT_SETTINGS;
  return (
    <main className="container-page flex-1 py-20 text-center">
      <p className="eyebrow">{s.businessName}</p>
      <h1 className="mt-3 text-3xl font-semibold">Something went wrong loading this page</h1>
      <p className="mx-auto mt-3 max-w-md text-muted">
        Please try again in a moment. You can still reach us directly by phone or WhatsApp.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="btn btn-primary">
          <RotateCw size={18} aria-hidden /> Try again
        </button>
        <a href={`tel:${s.phone}`} className="btn btn-outline">
          <Phone size={18} aria-hidden /> Call
        </a>
        <a href={whatsappLink(s.whatsapp, `Hi ${s.businessName}`)} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
          <MessageCircle size={18} aria-hidden /> WhatsApp
        </a>
      </div>
    </main>
  );
}
