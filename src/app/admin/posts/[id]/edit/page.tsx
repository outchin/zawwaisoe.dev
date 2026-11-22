import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/admin/AdminNav";
import { PostEditor } from "@/components/admin/PostEditor";
import { getTagsByTopic } from "@/lib/blog-tags";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post, tagsByTopic] = await Promise.all([prisma.post.findUnique({ where: { id } }), getTagsByTopic()]);
  if (!post) notFound();

  return (
    <>
      <AdminNav />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="mb-6 text-sm font-semibold text-muted">
          <span className="text-accent">$</span> edit post
        </h1>
        <PostEditor mode="edit" post={post} tagsByTopic={tagsByTopic} />
      </main>
    </>
  );
}
