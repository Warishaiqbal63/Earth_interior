"use client";

import { useRef, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

type Props = {
  /** Button content that opens the dialog. */
  children: ReactNode;
  className?: string;
  label?: string;
  title: string;
  body: ReactNode;
  confirmText: string;
  /** Return true to close the dialog; false keeps it open (e.g. on error). */
  onConfirm: () => Promise<boolean>;
  danger?: boolean;
};

/** A button that asks "are you sure?" in a native <dialog> before running an action. */
export function ConfirmButton({ children, className, label, title, body, confirmText, onConfirm, danger = true }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);

  async function confirm() {
    setBusy(true);
    const close = await onConfirm();
    setBusy(false);
    if (close) ref.current?.close();
  }

  return (
    <>
      <button type="button" className={className} aria-label={label} onClick={() => ref.current?.showModal()}>
        {children}
      </button>
      <dialog
        ref={ref}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-line bg-surface p-0 text-ink shadow-xl backdrop:bg-ink/40"
        onClick={(e) => {
          if (e.target === ref.current && !busy) ref.current?.close();
        }}
        onCancel={(e) => busy && e.preventDefault()}
      >
        <div className="p-6">
          <h2 className="font-sans text-lg font-semibold">{title}</h2>
          <div className="mt-2 text-sm text-muted">{body}</div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" className="btn btn-outline" onClick={() => ref.current?.close()} disabled={busy} autoFocus>
              Cancel
            </button>
            <button type="button" className={`btn ${danger ? "btn-danger" : "btn-primary"}`} onClick={confirm} disabled={busy}>
              {busy && <Loader2 size={16} className="animate-spin" aria-hidden />}
              {confirmText}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
