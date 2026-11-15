"use server";

import { refresh, updateTag } from "next/cache";
import { requireAdmin, UNAUTHORIZED } from "@/lib/auth/require-admin";
import { SERVER_ERROR, type ActionResult } from "@/lib/action-result";
import { validateSettings } from "@/lib/validate";
import { saveSettings } from "@/lib/data/settings";

export async function saveSettingsAction(input: unknown): Promise<ActionResult> {
  if (!(await requireAdmin())) return UNAUTHORIZED;
  const result = validateSettings(input);
  if (!result.ok) {
    return { ok: false, reason: "invalid", message: "Please fix the highlighted fields.", errors: result.errors };
  }
  try {
    await saveSettings(result.value);
    updateTag("settings");
    refresh();
    return { ok: true };
  } catch (e) {
    console.error(e);
    return SERVER_ERROR;
  }
}
