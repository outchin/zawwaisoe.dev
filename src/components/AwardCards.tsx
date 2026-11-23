"use client";

import { useCallback, useEffect, useState } from "react";

export type AwardCardData = {
  slug: string;
  kind: string;
  title: string;
  result: string | null;
  issuer: string | null;
  date: string | null;
  description: string;
  images: string[];
  credentialUrl: string | null;
  credentialId: string | null;
  validUntil: string | null;
};

/** prizes amber, finalists blue, certified green, everything else neutral */
function resultTone(result: string) {
  const r = result.toLowerCase();
  if (/(1st|2nd|3rd|first|second|third|prize|winner|award)/.test(r)) return "border-amber-300 bg-amber-50 text-amber-800";
  if (/(finalist|top|selected|shortlist)/.test(r)) return "border-accent/40 bg-accent/10 text-accent-hover";
  if (/certified/.test(r)) return "border-emerald-300 bg-emerald-50 text-emerald-800";
  return "border-border bg-background text-muted";
}

function ResultBadge({ result }: { result: string }) {
  return (
    <span className={`inline-block rounded-full border px-2 py-0.5 font-sans text-xs font-medium ${resultTone(result)}`}>
      {result}
    </span>
  );
}

function Placeholder({ kind }: { kind: string }) {
  return (
    <div className="flex aspect-[4/3] w-full items-center justify-center border-b border-border bg-gradient-to-br from-background to-accent/5 text-accent/40">
      {kind === "certification" ? (
        <svg viewBox="0 0 24 24" className="h-12 w-12" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
          <rect x="3" y="4" width="18" height="13" rx="2" />
          <path d="M7 8.5h10M7 11.5h6" />
          <circle cx="16.5" cy="17" r="2.5" />
          <path d="m15.2 19.2-.7 2.8 2-1 2 1-.7-2.8" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-12 w-12" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
          <path d="M8 4h8v5a4 4 0 0 1-8 0V4z" />
          <path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M9 20h6M10 17h4" />
        </svg>
      )}
    </div>
  );
}

function Viewer({ award, onClose }: { award: AwardCardData; onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const count = award.images.length;
  const step = useCallback((by: number) => setIndex((i) => (i + by + count) % count), [count]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (count > 1 && e.key === "ArrowRight") step(1);
      if (count > 1 && e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose, step, count]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={award.title}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="grid max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-lg bg-background shadow-2xl md:grid-cols-[1.4fr_1fr]"
      >
        <div className="relative flex min-h-[240px] flex-col bg-black/95">
          {count > 0 ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- uploaded photo, shown whole */}
              <img
                src={award.images[index]}
                alt={`${award.title} — photo ${index + 1} of ${count}`}
                className="max-h-[60vh] w-full flex-1 object-contain md:max-h-[80vh]"
              />
              {count > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    aria-label="Previous photo"
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 px-3 py-2 text-white shadow hover:bg-black/80"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    aria-label="Next photo"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 px-3 py-2 text-white shadow hover:bg-black/80"
                  >
                    →
                  </button>
                  <div className="flex gap-2 overflow-x-auto p-2">
                    {award.images.map((src, i) => (
                      <button
                        key={src}
                        type="button"
                        onClick={() => setIndex(i)}
                        aria-label={`Photo ${i + 1}`}
                        className={`h-12 w-16 shrink-0 overflow-hidden rounded border-2 ${i === index ? "border-accent" : "border-transparent opacity-60 hover:opacity-100"}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element -- thumbnail */}
                        <img src={src} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-10 text-sm text-white/60">Photos coming soon</div>
          )}
        </div>

        <div className="flex flex-col overflow-y-auto p-6">
          <div className="flex items-start justify-between gap-4">
            {award.result && <ResultBadge result={award.result} />}
            <button type="button" onClick={onClose} aria-label="Close" className="ml-auto text-muted hover:text-foreground">
              ✕
            </button>
          </div>
          <h3 className="mt-3 text-lg font-semibold text-foreground">{award.title}</h3>
          {(award.issuer || award.date) && (
            <p className="mt-1 font-sans text-sm text-muted">{[award.issuer, award.date].filter(Boolean).join(" · ")}</p>
          )}
          {award.description && (
            <p className="mt-4 whitespace-pre-line font-sans text-sm leading-relaxed text-muted">{award.description}</p>
          )}
          {(award.credentialId || award.validUntil || award.credentialUrl) && (
            <div className="mt-6 space-y-1 border-t border-border pt-4 font-sans text-xs text-muted">
              {award.credentialId && <p>Credential ID: {award.credentialId}</p>}
              {award.validUntil && (
                <p>
                  {/expired/i.test(award.result ?? "") ? "Expired" : "Valid until"} {award.validUntil}
                </p>
              )}
              {award.credentialUrl && (
                <a
                  href={award.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block pt-1 text-sm font-medium text-accent hover:text-accent-hover"
                >
                  Verify credential ↗
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AwardCards({ awards, columns }: { awards: AwardCardData[]; columns: 2 | 3 }) {
  const [open, setOpen] = useState<AwardCardData | null>(null);
  const close = useCallback(() => setOpen(null), []);

  return (
    <>
      <div className={`mt-4 grid gap-4 sm:grid-cols-2 ${columns === 3 ? "lg:grid-cols-3" : ""}`}>
        {awards.map((award) => (
          <button
            key={award.slug}
            type="button"
            onClick={() => setOpen(award)}
            className="group flex flex-col justify-start overflow-hidden rounded-lg border border-border bg-background-elevated text-left transition-colors hover:border-accent"
          >
            <div className="relative">
              {award.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element -- uploaded photo
                <img
                  src={award.images[0]}
                  alt=""
                  className="aspect-[4/3] w-full border-b border-border object-cover transition-opacity group-hover:opacity-90"
                />
              ) : (
                <Placeholder kind={award.kind} />
              )}
              {award.images.length > 1 && (
                <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 font-sans text-xs text-white">
                  {award.images.length} photos
                </span>
              )}
            </div>
            <div className="p-4">
              {award.result && <ResultBadge result={award.result} />}
              <h4 className="mt-2 font-semibold text-foreground group-hover:text-accent">{award.title}</h4>
              {(award.issuer || award.date) && (
                <p className="mt-0.5 font-sans text-xs text-muted">{[award.issuer, award.date].filter(Boolean).join(" · ")}</p>
              )}
              {award.description && (
                <p className="mt-2 line-clamp-3 font-sans text-sm leading-relaxed text-muted">{award.description}</p>
              )}
            </div>
          </button>
        ))}
      </div>
      {open && <Viewer key={open.slug} award={open} onClose={close} />}
    </>
  );
}
