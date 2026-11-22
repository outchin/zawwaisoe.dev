"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { slugify } from "@/lib/slug";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { DEFAULT_SECTION, MAX_TAGS, SECTIONS, findSection, normalizeTags, tagSlug } from "@/lib/blog-taxonomy";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  category: string;
  topic: string | null;
  tags: string[];
  published: boolean;
};

/** tags already used on other posts, by topic slug ("" = no topic): offered as one-click suggestions */
export type TagsByTopic = Record<string, string[]>;

export function PostEditor({
  mode,
  post,
  tagsByTopic = {},
}: {
  mode: "create" | "edit";
  post?: Post;
  tagsByTopic?: TagsByTopic;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? "");
  const [category, setCategory] = useState(post?.category ?? DEFAULT_SECTION);
  const [topic, setTopic] = useState(post?.topic ?? "");
  const [tagsText, setTagsText] = useState((post?.tags ?? []).join(", "));
  const [published, setPublished] = useState(post?.published ?? false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  const section = findSection(category);
  const currentTags = normalizeTags(tagsText);
  const currentTagSlugs = new Set(currentTags.map(tagSlug));
  const suggestions = (tagsByTopic[topic] ?? []).filter((t) => !currentTagSlugs.has(tagSlug(t)));

  function handleCategoryChange(value: string) {
    setCategory(value);
    // keep the topic only if the new section has it too (engineering ↔ labs share topics)
    if (!findSection(value)?.topics.some((t) => t.slug === topic)) setTopic("");
  }

  function addTag(tag: string) {
    setTagsText(normalizeTags([...currentTags, tag]).join(", "));
  }

  async function uploadImage(file: File) {
    const form = new FormData();
    form.append("file", file);
    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body: form,
    });
    if (!response.ok) throw new Error("Upload failed");
    const data = await response.json();
    return data.url as string;
  }

  async function handleCoverUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      setCoverImage(await uploadImage(file));
    } catch {
      setError("Cover image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleInlineImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const url = await uploadImage(file);
      const markdown = `![${file.name}](${url})`;
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        setContent(content.slice(0, start) + markdown + content.slice(end));
      } else {
        setContent((prev) => `${prev}\n\n${markdown}\n`);
      }
    } catch {
      setError("Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const payload = { title, slug, excerpt, content, coverImage, category, topic, tags: normalizeTags(tagsText), published };
    const url = mode === "create" ? "/api/admin/posts" : `/api/admin/posts/${post!.id}`;
    const method = mode === "create" ? "POST" : "PUT";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <div>
          <label htmlFor="title" className="text-xs text-muted">
            Title
          </label>
          <input
            id="title"
            required
            value={title}
            onChange={(event) => handleTitleChange(event.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
          />
        </div>
        <div>
          <label htmlFor="published" className="text-xs text-muted">
            Status
          </label>
          <label className="mt-1 flex h-[38px] items-center gap-2 rounded-md border border-border px-3 text-sm">
            <input
              id="published"
              type="checkbox"
              checked={published}
              onChange={(event) => setPublished(event.target.checked)}
            />
            Published
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="slug" className="text-xs text-muted">
          Slug — /blog/{slug || "…"}
        </label>
        <input
          id="slug"
          required
          value={slug}
          onChange={(event) => {
            setSlugTouched(true);
            setSlug(slugify(event.target.value));
          }}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="category" className="text-xs text-muted">
            Section
          </label>
          <select
            id="category"
            value={category}
            onChange={(event) => handleCategoryChange(event.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
          >
            {SECTIONS.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="topic" className="text-xs text-muted">
            Topic
          </label>
          <select
            id="topic"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
          >
            <option value="">— none —</option>
            {section?.topics.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="tags" className="text-xs text-muted">
            Tags — comma separated, max {MAX_TAGS}
          </label>
          <input
            id="tags"
            value={tagsText}
            onChange={(event) => setTagsText(event.target.value)}
            placeholder="Scheduling, Security"
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
          />
          {suggestions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {suggestions.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addTag(tag)}
                  className="rounded-full border border-border px-2 py-0.5 text-xs text-muted hover:border-accent hover:text-accent"
                >
                  + {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="excerpt" className="text-xs text-muted">
          Excerpt (shown on the blog list page)
        </label>
        <textarea
          id="excerpt"
          rows={2}
          value={excerpt}
          onChange={(event) => setExcerpt(event.target.value)}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
        />
      </div>

      <div>
        <span className="text-xs text-muted">Cover image</span>
        <div className="mt-1 flex items-center gap-3">
          {coverImage && (
            // eslint-disable-next-line @next/next/no-img-element -- admin-only preview of an uploaded image
            <img
              src={coverImage}
              alt="Cover preview"
              className="h-16 w-28 rounded border border-border object-cover"
            />
          )}
          <label className="cursor-pointer rounded-md border border-border px-3 py-2 text-sm hover:border-accent hover:text-accent">
            {uploading ? "Uploading…" : coverImage ? "Replace image" : "Upload image"}
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
          {coverImage && (
            <button
              type="button"
              onClick={() => setCoverImage("")}
              className="text-sm text-muted hover:text-foreground"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted">Content (Markdown)</span>
          <label className="cursor-pointer text-xs text-accent hover:text-accent-hover">
            {uploading ? "Uploading…" : "+ Insert image"}
            <input
              type="file"
              accept="image/*"
              onChange={handleInlineImageUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>

        <div className="mt-1 grid gap-4 sm:grid-cols-2">
          <textarea
            ref={textareaRef}
            required
            rows={20}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Write in Markdown — headings, **bold**, [links](https://…), ![alt](image-url)…"
            className="w-full rounded-md border border-border bg-background p-3 font-mono text-sm text-foreground outline-none focus:border-accent"
          />
          <div className="prose prose-sm max-w-none overflow-y-auto rounded-md border border-dashed border-border p-3 font-sans prose-headings:text-foreground prose-a:text-accent hover:prose-a:text-accent-hover">
            {content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {content}
              </ReactMarkdown>
            ) : (
              <p className="text-sm text-muted">Preview shows up here as you type.</p>
            )}
          </div>
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
        {mode === "edit" && post && (
          <DeleteButton
            id={post.id}
            title={post.title}
            onDeleted={() => router.push("/admin")}
          />
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </form>
  );
}
