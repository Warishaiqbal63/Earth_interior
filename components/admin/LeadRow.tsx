"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Check, MessageCircle, Phone, RotateCcw, Trash2 } from "lucide-react";
import type { Lead } from "@/lib/types";
import { displayPkPhone } from "@/lib/phone";
import { whatsappLink } from "@/lib/whatsapp";
import { deleteLeadAction, markLeadHandledAction } from "@/app/admin/actions/leads";
import { ConfirmButton } from "./ConfirmButton";
import { runAction } from "./run-action";

function timeAgo(iso: string): string {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function LeadRow({ lead, compact = false }: { lead: Lead; compact?: boolean }) {
  const [pending, start] = useTransition();
  const greeting = `Hi ${lead.name}, this is about your callback request${lead.productTitle ? ` for "${lead.productTitle}"` : ""}.`;

  return (
    <li className={`p-4 ${pending ? "opacity-60" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold">
            {lead.name}
            {lead.handled && <span className="ml-2 rounded-full bg-line px-2 py-0.5 text-xs font-medium text-muted">Done</span>}
          </p>
          <p className="text-sm text-muted">
            <time dateTime={lead.createdAt} title={new Date(lead.createdAt).toLocaleString("en-GB")}>{timeAgo(lead.createdAt)}</time>
            {lead.productTitle && (
              <>
                {" · "}
                {lead.productSlug ? (
                  <Link href={`/furniture/${lead.productSlug}`} target="_blank" className="text-primary hover:underline">
                    {lead.productTitle}
                  </Link>
                ) : (
                  lead.productTitle
                )}
              </>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <a href={`tel:${lead.phone}`} className="btn btn-sm btn-outline">
            <Phone size={16} aria-hidden /> {displayPkPhone(lead.phone)}
          </a>
          <a href={whatsappLink(lead.phone, greeting)} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-whatsapp" aria-label={`WhatsApp ${lead.name}`}>
            <MessageCircle size={16} aria-hidden />
          </a>
        </div>
      </div>
      {lead.message && <p className="mt-2 whitespace-pre-line rounded-lg bg-ground p-3 text-sm">{lead.message}</p>}
      {!compact && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending}
            className="btn btn-sm btn-ghost"
            onClick={() =>
              start(async () => {
                await runAction(
                  () => markLeadHandledAction(lead.id, !lead.handled),
                  lead.handled ? "Moved back to open requests." : "Marked as done.",
                );
              })
            }
          >
            {lead.handled ? <RotateCcw size={16} aria-hidden /> : <Check size={16} aria-hidden />}
            {lead.handled ? "Reopen" : "Mark as done"}
          </button>
          <ConfirmButton
            className="btn btn-sm btn-ghost hover:!bg-danger-soft hover:!text-danger"
            title="Delete this request?"
            body={`The request from ${lead.name} will be removed permanently.`}
            confirmText="Delete"
            onConfirm={() => runAction(() => deleteLeadAction(lead.id), "Request deleted.")}
          >
            <Trash2 size={16} aria-hidden /> Delete
          </ConfirmButton>
        </div>
      )}
    </li>
  );
}
