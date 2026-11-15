"use server";

import { validateLead } from "@/lib/validate";
import { createLead, recordLeadAttempt } from "@/lib/data/leads";
import { clientIp } from "@/lib/auth/rate-limit";

export type LeadState =
  | { status: "idle" }
  | { status: "sent"; name: string }
  | {
      status: "error";
      message?: string;
      errors?: Record<string, string>;
      values?: { name: string; phone: string; message: string };
    };

const MAX_PER_HOUR = 5;

export async function submitLead(_prev: LeadState, formData: FormData): Promise<LeadState> {
  const raw = Object.fromEntries(formData);
  const values = {
    name: String(raw.name ?? ""),
    phone: String(raw.phone ?? ""),
    message: String(raw.message ?? ""),
  };
  const result = validateLead(raw);
  if (!result.ok) {
    return { status: "error", message: result.errors.form, errors: result.errors, values };
  }
  try {
    const attempts = await recordLeadAttempt(await clientIp());
    if (attempts > MAX_PER_HOUR) {
      return {
        status: "error",
        message: "You've sent several requests already. We'll be in touch, or call/WhatsApp us directly.",
        values,
      };
    }
    await createLead(result.value);
    return { status: "sent", name: result.value.name.split(" ")[0] };
  } catch (error) {
    console.error("Callback request failed", error);
    return {
      status: "error",
      message: "Sorry, we couldn't send that right now. Please call or WhatsApp us instead.",
      values,
    };
  }
}
