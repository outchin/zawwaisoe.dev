import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/admin/AdminNav";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { statusLabel, type ProjectStatus } from "@/lib/project-status";

export const dynamic = "force-dynamic";

export default async function AdminProjectsDashboard() {
  const projects = await prisma.project.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      status: true,
      published: true,
      updatedAt: true,
    },
  });

  return (
    <>
      <AdminNav />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-sm font-semibold text-muted">
            <span className="text-accent">$</span> ls ./projects
          </h1>
          <Link
            href="/admin/projects/new"
            className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
          >
            New project
          </Link>
        </div>

        <div className="mt-6 divide-y divide-border rounded-lg border border-border">
          {projects.length === 0 && (
            <p className="p-5 font-sans text-sm text-muted">No projects yet.</p>
          )}
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex items-center justify-between gap-4 p-4 text-sm"
            >
              <div>
                <p className="font-medium text-foreground">{project.title}</p>
                <p className="font-sans text-xs text-muted">
                  {project.published ? "published" : "draft"} ·{" "}
                  {statusLabel[project.status as ProjectStatus] ?? project.status} · updated{" "}
                  {project.updatedAt.toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/admin/projects/${project.id}/edit`}
                  className="text-accent hover:text-accent-hover"
                >
                  Edit
                </Link>
                <DeleteButton
                  id={project.id}
                  title={project.title}
                  deleteUrl={`/api/admin/projects/${project.id}`}
                />
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
