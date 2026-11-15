"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Play, X } from "lucide-react";
import { PORTFOLIO, PORTFOLIO_KINDS, type PortfolioItem, type PortfolioKind } from "@/lib/portfolio";

/** Grid of project photos and videos with a filter and a full-screen viewer (native <dialog>). */
export function PortfolioGallery({ limit }: { limit?: number }) {
  const [kind, setKind] = useState<PortfolioKind | "All">("All");
  const [open, setOpen] = useState<PortfolioItem | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  const items = PORTFOLIO.filter((i) => kind === "All" || i.kind === kind).slice(0, limit);

  const show = (item: PortfolioItem) => {
    setOpen(item);
    dialog.current?.showModal();
  };

  return (
    <>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden" role="group" aria-label="Filter projects">
        {(["All", ...PORTFOLIO_KINDS] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            aria-pressed={kind === k}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              kind === k ? "border-primary bg-primary text-white" : "border-line bg-surface text-ink hover:border-primary hover:text-primary"
            }`}
          >
            {k === "All" ? "All work" : k === "Installation" ? "Being installed" : k === "3D design" ? "3D designs" : "Finished"}
          </button>
        ))}
      </div>

      <ul className="mt-6 columns-2 gap-3 sm:gap-4 lg:columns-3">
        {items.map((item) => (
          <li key={item.src} className="mb-3 break-inside-avoid sm:mb-4">
            <button
              type="button"
              onClick={() => show(item)}
              className="group block w-full text-left"
              aria-label={item.type === "video" ? `Play video: ${item.caption}` : `View photo: ${item.caption}`}
            >
              <span className="relative block overflow-hidden rounded-xl bg-accent-soft">
                <Image
                  src={item.type === "video" ? item.poster : item.src}
                  alt={item.type === "image" ? item.alt : ""}
                  width={item.width}
                  height={item.height}
                  sizes="(min-width: 1024px) 33vw, 50vw"
                  className="h-auto w-full transition-transform duration-300 group-hover:scale-[1.02]"
                />
                {item.type === "video" && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-primary shadow-lg sm:h-14 sm:w-14">
                      <Play size={22} className="ml-1" aria-hidden />
                    </span>
                  </span>
                )}
                <span className="absolute left-2 top-2 rounded-full bg-surface/90 px-2 py-0.5 text-[11px] font-medium text-ink">
                  {item.kind === "3D design" ? "3D design" : item.kind === "Installation" ? "Being installed" : "Finished"}
                </span>
              </span>
              <span className="mt-1.5 block text-sm font-medium leading-snug text-ink group-hover:text-primary">{item.caption}</span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        onClose={() => setOpen(null)}
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        className="m-auto max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-4xl overflow-hidden rounded-xl bg-ink p-0 text-white backdrop:bg-ink/80"
        aria-label={open?.caption ?? "Project"}
      >
        {open && (
          <div className="relative">
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              className="absolute right-2 top-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-ink/70 text-white hover:bg-ink"
              aria-label="Close"
              autoFocus
            >
              <X size={22} />
            </button>
            {open.type === "video" ? (
              <video
                key={open.src}
                src={open.src}
                poster={open.poster}
                controls
                autoPlay
                playsInline
                className="mx-auto max-h-[82dvh] w-auto bg-black"
              />
            ) : (
              <Image
                src={open.src}
                alt={open.alt}
                width={open.width}
                height={open.height}
                sizes="(min-width: 1024px) 900px, 100vw"
                className="mx-auto max-h-[82dvh] w-auto object-contain"
              />
            )}
            <p className="px-4 py-3 text-sm">{open.caption}</p>
          </div>
        )}
      </dialog>
    </>
  );
}
