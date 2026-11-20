"use client";

import { useEffect, useState, type ImgHTMLAttributes } from "react";

/**
 * Replaces inline Markdown <img> rendering in blog posts: click a thumbnail
 * to open it full-size in an overlay, click (or Escape) to dismiss.
 */
export function LightboxImage(props: ImgHTMLAttributes<HTMLImageElement>) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  if (!props.src) return null;

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- dynamic post-content image */}
      <img
        {...props}
        onClick={() => setOpen(true)}
        className={`${props.className ?? ""} cursor-zoom-in rounded-md border border-border transition-opacity hover:opacity-90`.trim()}
      />
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[100] flex cursor-zoom-out items-center justify-center bg-black/85 p-6 backdrop-blur-sm"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- full-size preview of the same image */}
          <img
            src={props.src}
            alt={props.alt ?? ""}
            className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
          />
        </div>
      )}
    </>
  );
}
