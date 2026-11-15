"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

type ToastItem = { id: number; kind: "success" | "error"; text: string };
type Listener = (t: ToastItem) => void;

const listeners = new Set<Listener>();
let nextId = 1;

/** Shows a short message at the bottom of the screen. Callable from any client component. */
export function toast(text: string, kind: ToastItem["kind"] = "success") {
  const item = { id: nextId++, kind, text };
  listeners.forEach((l) => l(item));
}

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const add: Listener = (t) => {
      setItems((list) => [...list.slice(-2), t]);
      window.setTimeout(() => setItems((list) => list.filter((i) => i.id !== t.id)), t.kind === "error" ? 7000 : 3500);
    };
    listeners.add(add);
    return () => {
      listeners.delete(add);
    };
  }, []);

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 md:bottom-6">
      {items.map((t) => (
        <div
          key={t.id}
          role={t.kind === "error" ? "alert" : "status"}
          className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-lg px-4 py-3 text-sm text-white shadow-lg ${
            t.kind === "error" ? "bg-danger" : "bg-ink"
          }`}
        >
          {t.kind === "error" ? <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden /> : <CheckCircle2 size={18} className="mt-0.5 shrink-0" aria-hidden />}
          <span className="flex-1">{t.text}</span>
          <button type="button" onClick={() => setItems((l) => l.filter((i) => i.id !== t.id))} aria-label="Dismiss" className="opacity-80 hover:opacity-100">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
