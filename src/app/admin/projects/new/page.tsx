import { AdminNav } from "@/components/admin/AdminNav";
import { ProjectEditor } from "@/components/admin/ProjectEditor";

export default function NewProjectPage() {
  return (
    <>
      <AdminNav />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="mb-6 text-sm font-semibold text-muted">
          <span className="text-accent">$</span> new project
        </h1>
        <ProjectEditor mode="create" />
      </main>
    </>
  );
}
