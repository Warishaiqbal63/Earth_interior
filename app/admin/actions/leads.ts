"use server";

import { refresh } from "next/cache";
import { requireAdmin, UNAUTHORIZED } from "@/lib/auth/require-admin";
import { NOT_FOUND, SERVER_ERROR, type ActionResult } from "@/lib/action-result";
import { deleteLead, setLeadHandled } from "@/lib/data/leads";

export async function markLeadHandledAction(id: number, handled: boolean): Promise<ActionResult> {
  if (!(await requireAdmin())) return UNAUTHORIZED;
  try {
    if (!(await setLeadHandled(id, handled))) return NOT_FOUND;
    refresh();
    return { ok: true };
  } catch (e) {
    console.error(e);
    return SERVER_ERROR;
  }
}

export async function deleteLeadAction(id: number): Promise<ActionResult> {
  if (!(await requireAdmin())) return UNAUTHORIZED;
  try {
    if (!(await deleteLead(id))) return NOT_FOUND;
    refresh();
    return { ok: true };
  } catch (e) {
    console.error(e);
    return SERVER_ERROR;
  }
}
