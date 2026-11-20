"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/slug";
import { PROJECT_STATUSES, statusLabel, type ProjectStatus } from "@/lib/project-status";
import { DeleteButton } from "@/components/admin/DeleteButton";

type Project = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  status: string;
  year: string;
  stack: string[];
  image: string | null;
  screenshots: string[];
  problem: string;
  approach: string;
  features: string[];
  challenges: string;
  outcome: string;
  githubUrl: string | null;
  liveUrl: string | null;
  published: boolean;
  order: number;
};

export function ProjectEditor({
  mode,
  project,
}: {
  mode: "create" | "edit";
  project?: Project;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(project?.title ?? "");
  const [slug, setSlug] = useState(project?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [summary, setSummary] = useState(project?.summary ?? "");
  const [status, setStatus] = useState<ProjectStatus>(
    (project?.status as ProjectStatus) ?? "in-progress"
  );
  const [year, setYear] = useState(project?.year ?? String(new Date().getFullYear()));
  const [stack, setStack] = useState((project?.stack ?? []).join(", "));
  const [image, setImage] = useState(project?.image ?? "");
  const [screenshots, setScreenshots] = useState((project?.screenshots ?? []).join("\n"));
  const [problem, setProblem] = useState(project?.problem ?? "");
  const [approach, setApproach] = useState(project?.approach ?? "");
  const [features, setFeatures] = useState((project?.features ?? []).join("\n"));
  const [challenges, setChallenges] = useState(project?.challenges ?? "");
  const [outcome, setOutcome] = useState(project?.outcome ?? "");
  const [githubUrl, setGithubUrl] = useState(project?.githubUrl ?? "");
  const [liveUrl, setLiveUrl] = useState(project?.liveUrl ?? "");
  const [published, setPublished] = useState(project?.published ?? true);
  const [order, setOrder] = useState(project?.order ?? 0);

  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [error, setError] = useState("");
  const screenshotsRef = useRef<HTMLTextAreaElement>(null);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function uploadImage(file: File) {
    const form = new FormData();
    form.append("file", file);
    const response = await fetch("/api/admin/upload", { method: "POST", body: form });
    if (!response.ok) throw new Error("Upload failed");
    const data = await response.json();
    return data.url as string;
  }

  async function handleCoverUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploadingCover(true);
    setError("");
    try {
      setImage(await uploadImage(file));
    } catch {
      setError("Cover image upload failed.");
    } finally {
      setUploadingCover(false);
    }
  }

  async function handleScreenshotUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploadingScreenshot(true);
    setError("");
    try {
      const url = await uploadImage(file);
      const textarea = screenshotsRef.current;
      const next = screenshots ? `${screenshots}\n${url}` : url;
      setScreenshots(next);
      textarea?.focus();
    } catch {
      setError("Screenshot upload failed.");
    } finally {
      setUploadingScreenshot(false);
    }
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      title,
      slug,
      summary,
      status,
      year,
      stack,
      image,
      screenshots,
      problem,
      approach,
      features,
      challenges,
      outcome,
      githubUrl,
      liveUrl,
      published,
      order,
    };
    const url = mode === "create" ? "/api/admin/projects" : `/api/admin/projects/${project!.id}`;
    const method = mode === "create" ? "POST" : "PUT";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      router.push("/admin/projects");
      router.refresh();
    } else {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      setSaving(false);
    }
  }

  const inputClass =
    "mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent";
  const labelClass = "text-xs text-muted";
  const textareaClass = `${inputClass} font-mono`;

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto]">
        <div>
          <label htmlFor="title" className={labelClass}>
            Title
          </label>
          <input
            id="title"
            required
            value={title}
            onChange={(event) => handleTitleChange(event.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="status" className={labelClass}>
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(event) => setStatus(event.target.value as ProjectStatus)}
            className={inputClass}
          >
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusLabel[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="year" className={labelClass}>
            Year
          </label>
          <input
            id="year"
            required
            value={year}
            onChange={(event) => setYear(event.target.value)}
            className={`${inputClass} w-24`}
          />
        </div>
      </div>

      <div>
        <label htmlFor="slug" className={labelClass}>
          Slug
        </label>
        <input
          id="slug"
          required
          value={slug}
          onChange={(event) => {
            setSlugTouched(true);
            setSlug(slugify(event.target.value));
          }}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="summary" className={labelClass}>
          Summary (one line, shown on the project card)
        </label>
        <textarea
          id="summary"
          rows={2}
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="stack" className={labelClass}>
          Stack (comma-separated, e.g. Next.js, TypeScript, PostgreSQL)
        </label>
        <input
          id="stack"
          value={stack}
          onChange={(event) => setStack(event.target.value)}
          className={inputClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="githubUrl" className={labelClass}>
            GitHub URL
          </label>
          <input
            id="githubUrl"
            value={githubUrl}
            onChange={(event) => setGithubUrl(event.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="liveUrl" className={labelClass}>
            Live URL
          </label>
          <input
            id="liveUrl"
            value={liveUrl}
            onChange={(event) => setLiveUrl(event.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <span className={labelClass}>Cover image</span>
        <div className="mt-1 flex items-center gap-3">
          {image && (
            // eslint-disable-next-line @next/next/no-img-element -- admin-only preview
            <img
              src={image}
              alt="Cover preview"
              className="h-16 w-28 rounded border border-border object-cover"
            />
          )}
          <label className="cursor-pointer rounded-md border border-border px-3 py-2 text-sm hover:border-accent hover:text-accent">
            {uploadingCover ? "Uploading…" : image ? "Replace image" : "Upload image"}
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              disabled={uploadingCover}
              className="hidden"
            />
          </label>
          {image && (
            <button
              type="button"
              onClick={() => setImage("")}
              className="text-sm text-muted hover:text-foreground"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="screenshots" className={labelClass}>
            Case study screenshots (one URL per line, shown in order)
          </label>
          <label className="cursor-pointer text-xs text-accent hover:text-accent-hover">
            {uploadingScreenshot ? "Uploading…" : "+ Upload screenshot"}
            <input
              type="file"
              accept="image/*"
              onChange={handleScreenshotUpload}
              disabled={uploadingScreenshot}
              className="hidden"
            />
          </label>
        </div>
        <textarea
          id="screenshots"
          ref={screenshotsRef}
          rows={4}
          value={screenshots}
          onChange={(event) => setScreenshots(event.target.value)}
          placeholder="/uploads/screenshot-1.png"
          className={`${textareaClass} mt-1`}
        />
      </div>

      <div className="rounded-lg border border-border p-4">
        <p className="mb-4 font-mono text-xs font-semibold uppercase tracking-wide text-muted">
          Case study
        </p>
        <div className="space-y-4">
          <div>
            <label htmlFor="problem" className={labelClass}>
              01. Problem
            </label>
            <textarea
              id="problem"
              rows={3}
              value={problem}
              onChange={(event) => setProblem(event.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="approach" className={labelClass}>
              02. Approach
            </label>
            <textarea
              id="approach"
              rows={3}
              value={approach}
              onChange={(event) => setApproach(event.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="features" className={labelClass}>
              03. Key features (one per line)
            </label>
            <textarea
              id="features"
              rows={4}
              value={features}
              onChange={(event) => setFeatures(event.target.value)}
              className={textareaClass}
            />
          </div>
          <div>
            <label htmlFor="challenges" className={labelClass}>
              04. Challenges
            </label>
            <textarea
              id="challenges"
              rows={3}
              value={challenges}
              onChange={(event) => setChallenges(event.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="outcome" className={labelClass}>
              05. Outcome
            </label>
            <textarea
              id="outcome"
              rows={3}
              value={outcome}
              onChange={(event) => setOutcome(event.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
        <label className="flex h-[38px] items-center gap-2 rounded-md border border-border px-3 text-sm">
          <input
            type="checkbox"
            checked={published}
            onChange={(event) => setPublished(event.target.checked)}
          />
          Published
        </label>
        <div>
          <label htmlFor="order" className={labelClass}>
            Sort order (lower shows first)
          </label>
          <input
            id="order"
            type="number"
            value={order}
            onChange={(event) => setOrder(Number(event.target.value) || 0)}
            className={`${inputClass} w-32`}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {mode === "edit" && project && (
          <DeleteButton
            id={project.id}
            title={project.title}
            deleteUrl={`/api/admin/projects/${project.id}`}
            onDeleted={() => router.push("/admin/projects")}
          />
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </form>
  );
}
