import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { ProjectBar } from "@/components/ProjectBar";
import { CodeBlock } from "@/components/blog/CodeBlock";
import { LightboxImage } from "@/components/blog/LightboxImage";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

async function getPost(slug: string) {
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post || !post.published) return null;
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
        <h1 className="text-3xl font-semibold text-foreground">{post.title}</h1>
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
