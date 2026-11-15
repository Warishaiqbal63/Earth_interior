"use client";

import { useId, useMemo, useState, useTransition, type ReactNode } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import type { Settings } from "@/lib/types";
import { saveSettingsAction } from "@/app/admin/actions/settings";
import { toast } from "@/components/admin/Toast";
import { useUnsavedWarning } from "@/components/admin/use-unsaved";

type Form = Omit<Settings, "trustPoints"> & { trustPoints: string };

export function SettingsForm({ initial }: { initial: Settings }) {
  const start0 = useMemo<Form>(() => ({ ...initial, trustPoints: initial.trustPoints.join("\n") }), [initial]);
  const uid = useId();
  const sid = (name: string) => uid + "s-" + name;
  const [form, setForm] = useState<Form>(start0);
  const [saved, setSaved] = useState(JSON.stringify(start0));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();
  const dirty = JSON.stringify(form) !== saved;
  useUnsavedWarning(dirty);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      try {
        const res = await saveSettingsAction({ ...form, trustPoints: form.trustPoints.split("\n") });
        if (res.ok) {
          setErrors({});
          setSaved(JSON.stringify(form));
          toast("Settings saved. The website is updated.");
        } else {
          setErrors(res.errors ?? {});
          toast(res.message, "error");
          if (res.errors) {
            const first = Object.keys(res.errors)[0];
            document.getElementById(sid(first))?.focus();
          }
        }
      } catch {
        toast("Couldn't reach the server. Check your connection and try again.", "error");
      }
    });
  }

  const text = (key: keyof Form & string, label: string, opts: { hint?: string; type?: string; placeholder?: string; inputMode?: "tel" } = {}) => (
    <div>
      <label htmlFor={sid(key)} className="label">{label}</label>
      <input
        id={sid(key)}
        type={opts.type ?? "text"}
        inputMode={opts.inputMode}
        placeholder={opts.placeholder}
        value={String(form[key] ?? "")}
        onChange={(e) => set(key, e.target.value as never)}
        aria-invalid={!!errors[key]}
        className="input"
      />
      {errors[key] ? <p className="field-error">{errors[key]}</p> : opts.hint && <p className="hint">{opts.hint}</p>}
    </div>
  );

  return (
    <form onSubmit={submit} className="mt-6 space-y-6" noValidate>
      <Section title="Business">
        {text("businessName", "Business name", { hint: "Shown in the header, footer, page titles and Google results." })}
        {text("tagline", "Short tagline", { placeholder: "Custom furniture, made in Lahore" })}
        {text("city", "City you serve", { hint: "Used in headings like “Made to order in Lahore”." })}
      </Section>

      <Section title="Contact">
        {text("phone", "Phone number", { type: "tel", inputMode: "tel", placeholder: "0300 1234567", hint: "Mobile or landline. Used for every “Call” button." })}
        {text("whatsapp", "WhatsApp number", { type: "tel", inputMode: "tel", placeholder: "0300 1234567", hint: "Must be a mobile number with WhatsApp." })}
        {text("email", "Email (optional)", { type: "email" })}
      </Section>

      <Section title="Address and hours">
        {text("addressStreet", "Street address")}
        {text("addressArea", "Area", { placeholder: "Gulberg III" })}
        {text("addressCity", "City")}
        {text("mapUrl", "Google Maps link", { hint: "Open your shop in Google Maps → Share → Copy link, and paste it here." })}
        {text("hours", "Opening hours", { placeholder: "Monday to Saturday, 10am to 8pm" })}
      </Section>

      <Section title="Why choose us" description="Short promises shown in the hero and on product pages. One per line, up to 6.">
        <textarea
          id={sid("trustPoints")}
          rows={5}
          value={form.trustPoints}
          onChange={(e) => set("trustPoints", e.target.value)}
          className="input"
        />
      </Section>

      <Section
        title="Customer testimonials"
        description="Only add real quotes from real customers, with their permission. Leave this empty to hide the section."
      >
        {form.testimonials.map((t, i) => (
          <div key={i} className="grid gap-3 rounded-lg border border-line p-3 sm:grid-cols-2">
            <input aria-label={`Testimonial ${i + 1} name`} placeholder="Customer name" value={t.name} className="input"
              onChange={(e) => set("testimonials", form.testimonials.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
            <input aria-label={`Testimonial ${i + 1} area`} placeholder="Area, e.g. DHA Lahore" value={t.area} className="input"
              onChange={(e) => set("testimonials", form.testimonials.map((x, j) => (j === i ? { ...x, area: e.target.value } : x)))} />
            <textarea aria-label={`Testimonial ${i + 1} quote`} placeholder="What they said" rows={2} value={t.quote} className="input sm:col-span-2"
              onChange={(e) => set("testimonials", form.testimonials.map((x, j) => (j === i ? { ...x, quote: e.target.value } : x)))} />
            <button type="button" className="btn btn-sm btn-ghost justify-self-start hover:!text-danger"
              onClick={() => set("testimonials", form.testimonials.filter((_, j) => j !== i))}>
              <Trash2 size={16} aria-hidden /> Remove
            </button>
          </div>
        ))}
        <button type="button" className="btn btn-sm btn-outline" disabled={form.testimonials.length >= 12}
          onClick={() => set("testimonials", [...form.testimonials, { name: "", area: "", quote: "" }])}>
          <Plus size={16} aria-hidden /> Add testimonial
        </button>
      </Section>

      <Section title="Frequently asked questions" description="Shown on the home page and to Google.">
        {form.faqs.map((f, i) => (
          <div key={i} className="grid gap-3 rounded-lg border border-line p-3">
            <input aria-label={`Question ${i + 1}`} placeholder="Question" value={f.q} className="input"
              onChange={(e) => set("faqs", form.faqs.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)))} />
            <textarea aria-label={`Answer ${i + 1}`} placeholder="Answer" rows={2} value={f.a} className="input"
              onChange={(e) => set("faqs", form.faqs.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)))} />
            <button type="button" className="btn btn-sm btn-ghost justify-self-start hover:!text-danger"
              onClick={() => set("faqs", form.faqs.filter((_, j) => j !== i))}>
              <Trash2 size={16} aria-hidden /> Remove
            </button>
          </div>
        ))}
        <button type="button" className="btn btn-sm btn-outline" disabled={form.faqs.length >= 20}
          onClick={() => set("faqs", [...form.faqs, { q: "", a: "" }])}>
          <Plus size={16} aria-hidden /> Add question
        </button>
      </Section>

      <div className="sticky bottom-16 z-20 flex items-center justify-end gap-3 rounded-xl border border-line bg-surface/95 p-3 shadow-sm backdrop-blur md:bottom-4">
        <span className="mr-auto text-sm text-muted">{dirty ? "You have unsaved changes." : "All changes saved."}</span>
        <button type="button" className="btn btn-ghost" disabled={!dirty || pending} onClick={() => { setForm(JSON.parse(saved)); setErrors({}); }}>
          Discard
        </button>
        <button type="submit" className="btn btn-primary" disabled={!dirty || pending}>
          {pending && <Loader2 size={18} className="animate-spin" aria-hidden />}
          {pending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <fieldset className="card space-y-4 p-5 sm:p-6">
      <legend className="sr-only">{title}</legend>
      <div>
        <h2 className="font-sans text-base font-semibold" aria-hidden>{title}</h2>
        {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
      </div>
      {children}
    </fieldset>
  );
}
