"use client";

import type { ActionResult } from "@/lib/action-result";
import { toast } from "./Toast";

/** Runs a server action, shows a toast for the outcome, and returns whether it succeeded. */
export async function runAction<T>(
  action: () => Promise<ActionResult<T>>,
  success?: string,
): Promise<boolean> {
  try {
    const result = await action();
    if (result.ok) {
      if (success) toast(success);
      return true;
    }
    toast(result.message, "error");
    return false;
  } catch {
    toast("Couldn't reach the server. Check your internet connection and try again.", "error");
    return false;
  }
}
