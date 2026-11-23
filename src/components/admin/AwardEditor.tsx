"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { AWARD_KINDS, MAX_AWARD_IMAGES, type AwardKind } from "@/lib/awards";

type Award = {
  id: string;
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
  published: boolean;
  order: number;
};

const inputClass =
  "mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent";
const labelClass = "text-xs text-muted";

export function AwardEditor({ mode, award }: { mode: "create" | "edit"; award?: Award }) {
  const router = useRouter();
  const [kind, setKind] = useState<AwardKind>((award?.kind as AwardKind) ?? "achievement");
  const [title, setTitle] = useState(award?.title ?? "");
  const [result, setResult] = useState(award?.result ?? "");
  const [issuer, setIssuer] = useState(award?.issuer ?? "");
  const [date, setDate] = useState(award?.date ?? "");
  const [description, setDescription] = useState(award?.description ?? "");
  const [images, setImages] = useState<string[]>(award?.images ?? []);
  const [credentialUrl, setCredentialUrl] = useState(award?.credentialUrl ?? "");
  const [credentialId, setCredentialId] = useState(award?.credentialId ?? "");
  const [validUntil, setValidUntil] = useState(award?.validUntil ?? "");
  const [published, setPublished] = useState(award?.published ?? true);
  const [order, setOrder] = useState(String(award?.order ?? 0));
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isCert = kind === "certification";

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = [...(event.target.files ?? [])].slice(0, MAX_AWARD_IMAGES - images.length);
    event.target.value = "";
    if (files.length === 0) return;
    setUploading(true);
    setError("");
    try {
      const urls: string[] = [];
      for (const file of files) {
        const form = new FormData();
        form.append("file", file);
        const response = await fetch("/api/admin/upload", { method: "POST", body: form });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error ?? "Upload failed");
        urls.push(data.url as string);
      }
      setImages((prev) => [...prev, ...urls]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function move(index: number, by: -1 | 1) {
    setImages((prev) => {
      const next = [...prev];
      const target = index + by;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      kind,
      title,
      result,
      issuer,
      date,
      description,
      images,
      credentialUrl,
      credentialId,
      validUntil,
      published,
      order: Number(order),
    };
    const url = mode === "create" ? "/api/admin/awards" : `/api/admin/awards/${award!.id}`;
    const response = await fetch(url, {
      method: mode === "create" ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      router.push("/admin/awards");
      router.refresh();
    } else {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto]">
        <div>
          <label htmlFor="title" className={labelClass}>
            Title
          </label>
          <input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="kind" className={labelClass}>
            Kind
          </label>
          <select id="kind" value={kind} onChange={(e) => setKind(e.target.value as AwardKind)} className={inputClass}>
            {AWARD_KINDS.map((k) => (
              <option key={k.slug} value={k.slug}>
                {k.single}
              </option>
            ))}
          </select>
        </div>
        <div>
          <span className={labelClass}>Status</span>
          <label className="mt-1 flex h-[38px] items-center gap-2 rounded-md border border-border px-3 text-sm">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            Published
          </label>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div>
          <label htmlFor="result" className={labelClass}>
            Result
          </label>
          <input
            id="result"
            value={result}
            onChange={(e) => setResult(e.target.value)}
            placeholder={isCert ? "Certified" : "3rd Prize · Finalist · Participant"}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="issuer" className={labelClass}>
            {isCert ? "Issued by" : "Organiser"}
          </label>
          <input
            id="issuer"
            value={issuer}
            onChange={(e) => setIssuer(e.target.value)}
            placeholder={isCert ? "The Linux Foundation" : "MPT"}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="date" className={labelClass}>
            When
          </label>
          <input
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            placeholder="2024 · Mar 2023 · University · 3rd year"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="order" className={labelClass}>
            Order (lower = first)
          </label>
          <input id="order" type="number" value={order} onChange={(e) => setOrder(e.target.value)} className={inputClass} />
        </div>
      </div>

      {isCert && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="credentialUrl" className={labelClass}>
              Verify URL (Credly, etc.)
            </label>
            <input
              id="credentialUrl"
              value={credentialUrl}
              onChange={(e) => setCredentialUrl(e.target.value)}
              placeholder="https://www.credly.com/badges/…"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="credentialId" className={labelClass}>
              Credential ID
            </label>
            <input id="credentialId" value={credentialId} onChange={(e) => setCredentialId(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="validUntil" className={labelClass}>
              Valid until
            </label>
            <input
              id="validUntil"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              placeholder="Mar 2027"
              className={inputClass}
            />
          </div>
        </div>
      )}

      <div>
        <label htmlFor="description" className={labelClass}>
          Description — what it was, what you did, what you learned
        </label>
        <textarea
          id="description"
          rows={6}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${inputClass} font-sans`}
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <span className={labelClass}>
            Photos &amp; certificate scans — the first one is the card image ({images.length}/{MAX_AWARD_IMAGES})
          </span>
          {images.length < MAX_AWARD_IMAGES && (
            <label className="cursor-pointer text-xs text-accent hover:text-accent-hover">
              {uploading ? "Uploading…" : "+ Add photos"}
              <input type="file" accept="image/*" multiple onChange={handleUpload} disabled={uploading} className="hidden" />
            </label>
          )}
        </div>
        {images.length === 0 ? (
          <p className="mt-2 rounded-md border border-dashed border-border p-4 text-sm text-muted">
            No photos yet. You can pick several at once.
          </p>
        ) : (
          <ul className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((src, i) => (
              <li key={src} className="overflow-hidden rounded-md border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element -- admin-only preview of an uploaded image */}
                <img src={src} alt="" className="aspect-[4/3] w-full bg-background-elevated object-contain" />
                <div className="flex items-center justify-between px-2 py-1 text-xs">
                  <span className="text-muted">{i === 0 ? "cover" : `#${i + 1}`}</span>
                  <span className="flex gap-2">
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="hover:text-accent disabled:opacity-30">
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => move(i, 1)}
                      disabled={i === images.length - 1}
                      className="hover:text-accent disabled:opacity-30"
                    >
                      →
                    </button>
                    <button
                      type="button"
                      onClick={() => setImages((prev) => prev.filter((x) => x !== src))}
                      className="text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving || uploading}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {mode === "edit" && award && (
          <DeleteButton
            id={award.id}
            title={award.title}
            deleteUrl={`/api/admin/awards/${award.id}`}
            onDeleted={() => router.push("/admin/awards")}
          />
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </form>
  );
}
