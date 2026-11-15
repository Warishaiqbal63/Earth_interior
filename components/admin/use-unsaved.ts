"use client";

import { useEffect } from "react";

/** Warns before closing or reloading the tab while there are unsaved changes. */
export function useUnsavedWarning(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    // In-app links: ask before leaving the form.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey || e.button !== 0) return;
      if (a.href.startsWith("tel:") || a.href.startsWith("mailto:")) return;
      if (!window.confirm("You have unsaved changes. Leave without saving?")) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [dirty]);
}
