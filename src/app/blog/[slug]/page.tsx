import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { ProjectBar } from "@/components/ProjectBar";
import { CodeBlock } from "@/components/blog/CodeBlock";
import { LightboxImage } from "@/components/blog/LightboxImage";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { findSection, tagSlug, topicLabel } from "@/lib/blog-taxonomy";
import { blogHref } from "@/lib/blog-href";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

async function getPost(slug: string) {
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post || !post.published) return null;
  if (post.publishedAt && post.publishedAt > new Date()) return null; // scheduled, not out yet
  return post;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  return { title: post?.title ?? "Post not found" };
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <>
      <ProjectBar />
      <main className="mx-auto max-w-3xl px-6 py-16">
        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element -- dynamic remote image, next/image domain config not worth it here
          <img
            src={post.coverImage}
            alt=""
            className="mb-8 w-full rounded-lg border border-border object-cover"
          />
        )}
        <nav aria-label="Breadcrumb" className="mb-3 font-mono text-xs text-muted">
          <Link href={blogHref({})} className="hover:text-accent">
            blog
          </Link>
          {" / "}
          <Link href={blogHref({ section: post.category })} className="hover:text-accent">
            {findSection(post.category)?.label ?? post.category}
          </Link>
          {post.topic && (
            <>
              {" / "}
              <Link href={blogHref({ section: post.category, topic: post.topic })} className="hover:text-accent">
                {topicLabel(post.topic)}
              </Link>
            </>
          )}
        </nav>
        <h1 className="text-3xl font-semibold text-foreground">{post.title}</h1>
        {post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={blogHref({ section: post.category, topic: post.topic ?? undefined, tag: tagSlug(tag) })}
                className="rounded-full border border-border px-2.5 py-0.5 font-mono text-xs text-muted hover:border-accent hover:text-accent"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
        {post.publishedAt && (
          <p className="mt-2 font-sans text-sm text-muted">
            {post.publishedAt.toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        )}

        <div className="prose prose-neutral mt-8 max-w-none font-sans prose-headings:text-foreground prose-strong:text-foreground prose-code:text-foreground prose-a:text-accent hover:prose-a:text-accent-hover">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{ pre: CodeBlock, img: LightboxImage }}
          >
            {post.content}
          </ReactMarkdown>
        </div>
      </main>
    </>
  );
}
