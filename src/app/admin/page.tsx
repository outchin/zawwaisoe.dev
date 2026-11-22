import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/admin/AdminNav";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { findSection, topicLabel } from "@/lib/blog-taxonomy";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      published: true,
      updatedAt: true,
      category: true,
      topic: true,
      tags: true,
    },
  });

  return (
    <>
      <AdminNav />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-sm font-semibold text-muted">
            <span className="text-accent">$</span> ls ./posts
          </h1>
          <Link
            href="/admin/posts/new"
            className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
          >
            New post
          </Link>
        </div>

        <div className="mt-6 divide-y divide-border rounded-lg border border-border">
          {posts.length === 0 && (
            <p className="p-5 font-sans text-sm text-muted">No posts yet.</p>
          )}
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center justify-between gap-4 p-4 text-sm"
            >
              <div>
                <p className="font-medium text-foreground">{post.title}</p>
                <p className="font-sans text-xs text-muted">
                  {post.published ? "published" : "draft"} · {findSection(post.category)?.label ?? post.category}
                  {post.topic ? ` › ${topicLabel(post.topic)}` : " › (no topic)"}
                  {post.tags.length > 0 && ` · ${post.tags.map((t) => `#${t}`).join(" ")}`} · updated{" "}
                  {post.updatedAt.toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/admin/posts/${post.id}/edit`}
                  className="text-accent hover:text-accent-hover"
                >
                  Edit
                </Link>
                <DeleteButton id={post.id} title={post.title} />
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
