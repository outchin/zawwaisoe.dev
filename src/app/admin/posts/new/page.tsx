import { AdminNav } from "@/components/admin/AdminNav";
import { PostEditor } from "@/components/admin/PostEditor";

export default function NewPostPage() {
  return (
    <>
      <AdminNav />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="mb-6 text-sm font-semibold text-muted">
          <span className="text-accent">$</span> new post
        </h1>
        <PostEditor mode="create" />
      </main>
    </>
  );
}
