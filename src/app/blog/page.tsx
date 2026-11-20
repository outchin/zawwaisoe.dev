import Link from "next/link";
import type { Metadata } from "next";
import { ProjectBar } from "@/components/ProjectBar";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
};

export default async function BlogIndexPage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    select: {
      slug: true,
      title: true,
      excerpt: true,
      coverImage: true,
      publishedAt: true,
    },
  });

  return (
    <>
      <ProjectBar />
      <main className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="text-sm font-semibold text-muted">
          <span className="text-accent">$</span> ls ./blog
        </h1>

        <div className="mt-6 space-y-4">
          {posts.length === 0 && (
            <p className="font-sans text-sm text-muted">
              Nothing posted yet — check back soon.
            </p>
          )}
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="flex gap-4 rounded-lg border border-border bg-background-elevated p-5 hover:border-accent"
            >
              {post.coverImage && (
                // eslint-disable-next-line @next/next/no-img-element -- dynamic per-post remote image, next/image domain config not worth it here
                <img
                  src={post.coverImage}
                  alt=""
                  className="h-24 w-36 shrink-0 rounded object-cover"
                />
              )}
              <div>
                <h2 className="font-semibold text-foreground">{post.title}</h2>
                {post.excerpt && (
                  <p className="mt-1 font-sans text-sm text-muted">{post.excerpt}</p>
                )}
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
