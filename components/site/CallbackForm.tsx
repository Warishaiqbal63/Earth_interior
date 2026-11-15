"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { submitLead, type LeadState } from "@/app/(site)/actions";

export function CallbackForm({ productId, productTitle, className = "" }: { productId?: number; productTitle?: string; className?: string }) {
  const [state, action, pending] = useActionState<LeadState, FormData>(submitLead, { status: "idle" });
  const idp = productId ? `-${productId}` : "";

  if (state.status === "sent") {
    return (
      <div role="status" className={`rounded-xl bg-primary-soft p-5 ${className}`}>
        <p className="flex items-center gap-2 font-semibold text-primary">
          <CheckCircle2 size={20} aria-hidden /> Thanks {state.name}, we have your request.
        </p>
        <p className="mt-1 text-sm text-ink">We'll call you on your number during working hours. For anything urgent, WhatsApp us.</p>
      </div>
    );
  }

  const err = state.status === "error" ? state.errors ?? {} : {};
  const values = state.status === "error" ? state.values : undefined;
  return (
    <form action={action} className={`space-y-4 ${className}`} noValidate>
      {productId && <input type="hidden" name="productId" value={productId} />}
      <div className="hidden" aria-hidden>
        <label>
          Leave this empty <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {state.status === "error" && state.message && (
        <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
          {state.message}
        </p>
      )}
      <div>
        <label htmlFor={`cb-name${idp}`} className="label">Your name</label>
        <input
          id={`cb-name${idp}`}
          name="name"
          autoComplete="name"
          required
          defaultValue={values?.name}
          aria-invalid={!!err.name}
          aria-describedby={err.name ? `cb-name-err${idp}` : undefined}
          className="input"
        />
        {err.name && <p id={`cb-name-err${idp}`} className="field-error">{err.name}</p>}
      </div>
      <div>
        <label htmlFor={`cb-phone${idp}`} className="label">Phone / WhatsApp number</label>
        <input
          id={`cb-phone${idp}`}
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="0300 1234567"
          required
          defaultValue={values?.phone}
          aria-invalid={!!err.phone}
          aria-describedby={err.phone ? `cb-phone-err${idp}` : undefined}
          className="input"
        />
        {err.phone && <p id={`cb-phone-err${idp}`} className="field-error">{err.phone}</p>}
      </div>
      <div>
        <label htmlFor={`cb-msg${idp}`} className="label">
          What would you like made? <span className="font-normal text-muted">(optional)</span>
        </label>
        <textarea
          id={`cb-msg${idp}`}
          name="message"
          rows={3}
          defaultValue={values?.message ?? (productTitle ? `I'm interested in "${productTitle}".` : "")}
          aria-invalid={!!err.message}
          className="input"
        />
        {err.message && <p className="field-error">{err.message}</p>}
      </div>
      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending && <Loader2 size={18} className="animate-spin" aria-hidden />}
        {pending ? "Sending…" : "Request a call back"}
      </button>
      <p className="text-xs text-muted">We only use your number to reply to this request.</p>
    </form>
  );
}
