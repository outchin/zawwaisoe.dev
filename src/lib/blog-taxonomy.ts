import { slugify } from "@/lib/slug";

/*
 * Blog taxonomy: Section → Topic → Tags.
 *
 *   Section  fixed list below (top tabs on /blog)
 *   Topic    fixed list per section (stored as its slug on Post.topic)
 *   Tags     free-form sub-topics typed in the editor (Post.tags), e.g. "Scheduling"
 *
 * To add a topic: add it here, deploy. Posts store slugs, so labels can be
 * renamed freely; renaming a slug needs a data migration.
 */

export type Topic = { slug: string; label: string };
export type Section = { slug: string; label: string; blurb: string; topics: Topic[] };

const ENGINEERING_TOPICS: Topic[] = [
  { slug: "kubernetes", label: "Kubernetes" },
  { slug: "containers", label: "Containers & Docker" },
  { slug: "aws", label: "AWS" },
  { slug: "networking", label: "Networking" },
  { slug: "linux", label: "Linux" },
  { slug: "security", label: "Security" },
  { slug: "devops", label: "DevOps & GitOps" },
  { slug: "backend", label: "Backend" },
];

export const SECTIONS: Section[] = [
  {
    slug: "engineering",
    label: "Engineering",
    blurb: "Notes on backend, cloud and DevOps — what I learn, written down.",
    topics: ENGINEERING_TOPICS,
  },
  {
    slug: "labs",
    label: "Labs",
    blurb: "Hands-on experiments: build it, break it, measure it.",
    // labs share the engineering topics, so a Kubernetes lab sits next to the Kubernetes notes
    topics: ENGINEERING_TOPICS,
  },
  {
    slug: "life",
    label: "Life",
    blurb: "Career, study and personal experience.",
    topics: [
      { slug: "career", label: "Career" },
      { slug: "study", label: "Study" },
      { slug: "personal", label: "Personal" },
    ],
  },
];

export const DEFAULT_SECTION = "engineering";
export const MAX_TAGS = 6;

export function findSection(slug: string | null | undefined) {
  return SECTIONS.find((s) => s.slug === slug);
}

export function findTopic(sectionSlug: string | null | undefined, topicSlug: string | null | undefined) {
  return findSection(sectionSlug)?.topics.find((t) => t.slug === topicSlug);
}

/** A topic's label from its slug, whichever section it's in (engineering and labs share topics). */
export function topicLabel(topicSlug: string) {
  for (const s of SECTIONS) {
    const t = s.topics.find((x) => x.slug === topicSlug);
    if (t) return t.label;
  }
  return topicSlug;
}

/** Tags are stored as typed ("Resource Management"); URLs and comparisons use their slug. */
export const tagSlug = (tag: string) => slugify(tag);

/** Trim, drop empties, de-duplicate by slug (first spelling wins), cap the count. */
export function normalizeTags(input: unknown): string[] {
  const raw = Array.isArray(input) ? input : typeof input === "string" ? input.split(",") : [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of raw) {
    if (typeof value !== "string") continue;
    const tag = value.trim().replace(/\s+/g, " ").slice(0, 40);
    const key = tagSlug(tag);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(tag);
    if (out.length === MAX_TAGS) break;
  }
  return out;
}

/**
 * Validates category/topic/tags from a request body.
 * Returns the clean values, or an error message.
 */
export function parseTaxonomy(body: { category?: unknown; topic?: unknown; tags?: unknown } | null) {
  const category = typeof body?.category === "string" && body.category ? body.category : DEFAULT_SECTION;
  const section = findSection(category);
  if (!section) return { error: `Unknown section "${category}"` } as const;

  const rawTopic = typeof body?.topic === "string" ? body.topic.trim() : "";
  if (rawTopic && !findTopic(category, rawTopic)) {
    return { error: `Topic "${rawTopic}" doesn't belong to ${section.label}` } as const;
  }

  return { category, topic: rawTopic || null, tags: normalizeTags(body?.tags) } as const;
}
