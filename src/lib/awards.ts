import { slugify } from "@/lib/slug";

/** Two kinds, shown as two groups on the homepage (certifications first, then student-years awards). */
export const AWARD_KINDS = [
  { slug: "certification", label: "Certifications", single: "Certification" },
  { slug: "achievement", label: "University awards (2017–2020)", single: "University award" },
] as const;

export type AwardKind = (typeof AWARD_KINDS)[number]["slug"];

export const isAwardKind = (v: unknown): v is AwardKind => AWARD_KINDS.some((k) => k.slug === v);

export const MAX_AWARD_IMAGES = 8;

const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const optional = (v: unknown) => text(v) || null;

/** One image URL per line (or a JSON array), blanks dropped, duplicates removed. */
export function parseImages(v: unknown): string[] {
  const raw = Array.isArray(v) ? v : typeof v === "string" ? v.split(/\r?\n/) : [];
  return [...new Set(raw.map((x) => String(x).trim()).filter(Boolean))].slice(0, MAX_AWARD_IMAGES);
}

/** Validates an admin request body. Returns the fields to save, or an error message. */
export function parseAward(body: Record<string, unknown> | null) {
  const title = text(body?.title);
  if (!title) return { error: "Title is required" } as const;
  if (!isAwardKind(body?.kind)) return { error: "Kind must be certification or achievement" } as const;

  const credentialUrl = optional(body?.credentialUrl);
  if (credentialUrl && !/^https?:\/\//i.test(credentialUrl)) {
    return { error: "Credential URL must start with http:// or https://" } as const;
  }

  const order = Number(body?.order);
  return {
    data: {
      kind: body.kind,
      title,
      result: optional(body?.result),
      issuer: optional(body?.issuer),
      date: optional(body?.date),
      description: text(body?.description),
      images: parseImages(body?.images),
      credentialUrl,
      credentialId: optional(body?.credentialId),
      validUntil: optional(body?.validUntil),
      published: body?.published === undefined ? true : Boolean(body.published),
      order: Number.isFinite(order) ? Math.trunc(order) : 0,
    },
    slugBase: text(body?.slug) || title,
  } as const;
}

export const awardSlug = (base: string) => slugify(base) || "award";
