import { prisma } from "@/lib/prisma";
import { ProjectCard } from "@/components/ProjectCard";

export async function Projects() {
  const projects = await prisma.project.findMany({
    where: { published: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return (
    <section id="projects" className="mx-auto max-w-5xl px-6 py-12">
      <h2 className="text-sm font-semibold text-muted">
        <span className="text-accent">$</span> ls ./projects
      </h2>

      <div className="mt-6 space-y-4">
        {projects.length === 0 && (
          <p className="font-sans text-sm text-muted">
            Nothing published yet — check back soon.
          </p>
        )}
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </section>
  );
}
