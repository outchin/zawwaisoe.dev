import { AdminNav } from "@/components/admin/AdminNav";
import { PostEditor } from "@/components/admin/PostEditor";
import { getTagsByTopic } from "@/lib/blog-tags";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const tagsByTopic = await getTagsByTopic();
  return (
    <>
      <AdminNav />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="mb-6 text-sm font-semibold text-muted">
          <span className="text-accent">$</span> new post
        </h1>
        <PostEditor mode="create" tagsByTopic={tagsByTopic} />
      </main>
    </>
  );
}
