import Link from "next/link";
import type { Metadata } from "next";
import { ProjectBar } from "@/components/ProjectBar";
import { prisma } from "@/lib/prisma";
import { SECTIONS, findSection, tagSlug, topicLabel } from "@/lib/blog-taxonomy";
import { blogHref, type BlogFilter } from "@/lib/blog-href";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
        active
          ? "border-accent bg-accent text-accent-foreground"
          : "border-border text-muted hover:border-accent hover:text-accent"
      }`}
    >
      {children}
    </Link>
  );
}

function Count({ n }: { n: number }) {
  return <span className="ml-1 opacity-60">{n}</span>;
}

export default async function BlogIndexPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const filter: BlogFilter = {
    section: findSection(one(params.section))?.slug,
    topic: one(params.topic),
    tag: one(params.tag),
  };

  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    select: {
      slug: true,
      title: true,
      excerpt: true,
      coverImage: true,
      publishedAt: true,
      category: true,
      topic: true,
      tags: true,
    },
  });

  // narrow one level at a time, so each row of chips counts what the next click would show
  const inSection = filter.section ? posts.filter((p) => p.category === filter.section) : posts;
  const inTopic = filter.topic ? inSection.filter((p) => p.topic === filter.topic) : inSection;
  const shown = filter.tag ? inTopic.filter((p) => p.tags.some((t) => tagSlug(t) === filter.tag)) : inTopic;

  const sectionCounts = SECTIONS.map((s) => ({ ...s, n: posts.filter((p) => p.category === s.slug).length })).filter(
    (s) => s.n > 0,
  );

  const topicCounts = new Map<string, number>();
  for (const p of inSection) if (p.topic) topicCounts.set(p.topic, (topicCounts.get(p.topic) ?? 0) + 1);
  const topics = [...topicCounts].sort((a, b) => b[1] - a[1]);

  const tagCounts = new Map<string, { label: string; n: number }>();
  if (filter.topic) {
    for (const p of inTopic)
      for (const t of p.tags) {
        const e = tagCounts.get(tagSlug(t)) ?? { label: t, n: 0 };
        e.n += 1;
        tagCounts.set(tagSlug(t), e);
      }
  }
  const tags = [...tagCounts].sort((a, b) => b[1].n - a[1].n);

  const section = findSection(filter.section);
  const path = ["blog", filter.section, filter.topic, filter.tag && `#${filter.tag}`].filter(Boolean).join("/");

  return (
    <>
      <ProjectBar />
      <main className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="text-sm font-semibold text-muted">
          <span className="text-accent">$</span> ls ./{path}
        </h1>

        {/* Sections */}
        <nav aria-label="Sections" className="mt-6 flex flex-wrap gap-2">
          <Chip href={blogHref({})} active={!filter.section}>
            All
            <Count n={posts.length} />
          </Chip>
          {sectionCounts.map((s) => (
            <Chip key={s.slug} href={blogHref({ section: s.slug })} active={filter.section === s.slug}>
              {s.label}
              <Count n={s.n} />
            </Chip>
          ))}
        </nav>
        {section && <p className="mt-3 font-sans text-sm text-muted">{section.blurb}</p>}

        {/* Topics */}
        {topics.length > 0 && (
          <nav aria-label="Topics" className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
            {topics.map(([slug, n]) => (
              <Chip
                key={slug}
                href={blogHref({ section: filter.section, topic: filter.topic === slug ? undefined : slug })}
                active={filter.topic === slug}
              >
                {topicLabel(slug)}
                <Count n={n} />
              </Chip>
            ))}
          </nav>
        )}

        {/* Tags inside the chosen topic */}
        {tags.length > 0 && (
          <nav aria-label="Tags" className="mt-3 flex flex-wrap gap-2">
            {tags.map(([slug, { label, n }]) => (
              <Chip
                key={slug}
                href={blogHref({ ...filter, tag: filter.tag === slug ? undefined : slug })}
                active={filter.tag === slug}
              >
                #{label}
                <Count n={n} />
              </Chip>
            ))}
          </nav>
        )}

        <div className="mt-8 space-y-4">
          {shown.length === 0 && (
            <p className="font-sans text-sm text-muted">
              Nothing here yet — check back soon.{" "}
              <Link href={blogHref({})} className="text-accent hover:text-accent-hover">
                See all posts
              </Link>
            </p>
          )}
          {shown.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="flex gap-4 rounded-lg border border-border bg-background-elevated p-5 hover:border-accent"
            >
              {post.coverImage && (
                // eslint-disable-next-line @next/next/no-img-element -- dynamic per-post remote image, next/image domain config not worth it here
                <img src={post.coverImage} alt="" className="h-24 w-36 shrink-0 rounded object-cover" />
              )}
              <div>
                <p className="font-mono text-xs text-muted">
                  {findSection(post.category)?.label ?? post.category}
                  {post.topic && <> › {topicLabel(post.topic)}</>}
                  {post.tags.length > 0 && <span className="text-accent"> {post.tags.map((t) => `#${t}`).join(" ")}</span>}
                </p>
                <h2 className="mt-1 font-semibold text-foreground">{post.title}</h2>
                {post.excerpt && <p className="mt-1 font-sans text-sm text-muted">{post.excerpt}</p>}
                {post.publishedAt && (
                  <p className="mt-2 font-sans text-xs text-muted">
                    {post.publishedAt.toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
