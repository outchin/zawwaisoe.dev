import { prisma } from "@/lib/prisma";
import { tagSlug } from "@/lib/blog-taxonomy";
import type { TagsByTopic } from "@/components/admin/PostEditor";

/** Every tag already used, grouped by topic slug ("" = posts without a topic), most used first. */
export async function getTagsByTopic(): Promise<TagsByTopic> {
  const posts = await prisma.post.findMany({ select: { topic: true, tags: true } });
  const counts = new Map<string, Map<string, { tag: string; n: number }>>();
  for (const post of posts) {
    const key = post.topic ?? "";
    const byTag = counts.get(key) ?? new Map();
    counts.set(key, byTag);
    for (const tag of post.tags) {
      const entry = byTag.get(tagSlug(tag)) ?? { tag, n: 0 };
      entry.n += 1;
      byTag.set(tagSlug(tag), entry);
    }
  }
  return Object.fromEntries(
    [...counts].map(([topic, byTag]) => [topic, [...byTag.values()].sort((a, b) => b.n - a.n).map((e) => e.tag)]),
  );
}
