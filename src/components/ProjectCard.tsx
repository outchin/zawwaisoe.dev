"use client";

import { useState } from "react";
import { statusLabel, type ProjectStatus } from "@/lib/project-status";
import { ArchitectureDiagram } from "@/components/arch/ArchitectureDiagram";
import { architectures } from "@/data/architectures";

export type ProjectCardData = {
  slug: string;
  title: string;
  summary: string;
  status: string;
  year: string;
  stack: string[];
  image: string | null;
  screenshots: string[];
  problem: string;
  approach: string;
  features: string[];
  challenges: string;
  outcome: string;
  githubUrl: string | null;
  liveUrl: string | null;
};

export function ProjectCard({ project }: { project: ProjectCardData }) {
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <article className="overflow-hidden rounded-lg border border-border bg-background-elevated">
      {project.image ? (
        // eslint-disable-next-line @next/next/no-img-element -- static local screenshot, not worth next/image's overhead
        <img
          src={project.image}
          alt={`${project.title} screenshot`}
          className="aspect-video w-full border-b border-border object-cover"
        />
      ) : (
        <div className="flex aspect-video w-full items-center justify-center border-b border-dashed border-border font-sans text-xs text-muted">
          Add a screenshot in the admin panel
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-3 p-5">
        <div>
          <h3 className="font-semibold text-foreground">{project.title}</h3>
          <p className="mt-1 font-sans text-sm text-muted">{project.summary}</p>
        </div>
        <span className="whitespace-nowrap rounded-full border border-border px-2.5 py-0.5 text-xs text-muted">
          {statusLabel[project.status as ProjectStatus] ?? project.status} · {project.year}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 px-5 pb-4">
        {project.stack.map((tech) => (
          <span
            key={tech}
            className="rounded border border-border px-2 py-0.5 text-xs text-accent"
          >
            {tech}
          </span>
        ))}
      </div>

      <div className="flex gap-4 border-t border-border px-5 py-3 text-sm">
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="text-accent hover:text-accent-hover"
          >
            Live demo ↗
          </a>
        )}
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="text-muted hover:text-foreground"
          >
            Source ↗
          </a>
        )}
      </div>

      {/* Step-by-step case study — plain <details>, no animation, so it
          doubles as interview talking points when walking through the project. */}
      <details className="border-t border-border">
        <summary className="flex items-center justify-between px-5 py-3 text-sm text-muted hover:text-foreground">
          <span>Case study</span>
          <span aria-hidden className="text-accent">
            [+]
          </span>
        </summary>

        <div className="space-y-4 px-5 pb-5 font-sans text-sm leading-relaxed text-muted">
          <div>
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wide text-foreground">
              01. Problem
            </h4>
            <p className="mt-1">{project.problem}</p>
          </div>
          <div>
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wide text-foreground">
              02. Approach
            </h4>
            <p className="mt-1">{project.approach}</p>
          </div>
          {architectures[project.slug] && (
            <div>
              <h4 className="font-mono text-xs font-semibold uppercase tracking-wide text-foreground">
                Architecture
              </h4>
              <div className="mt-2">
                <ArchitectureDiagram architecture={architectures[project.slug]} />
              </div>
            </div>
          )}
          <div>
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wide text-foreground">
              03. Key features
            </h4>
            <ul className="mt-1 list-inside list-disc">
              {project.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wide text-foreground">
              04. Challenges
            </h4>
            <p className="mt-1">{project.challenges}</p>
          </div>
          <div>
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wide text-foreground">
              05. Outcome
            </h4>
            <p className="mt-1">{project.outcome}</p>
          </div>

          {project.screenshots.length > 0 && (
            <div>
              <h4 className="font-mono text-xs font-semibold uppercase tracking-wide text-foreground">
                Screenshots
              </h4>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {project.screenshots.map((src) => (
                  // eslint-disable-next-line @next/next/no-img-element -- dynamic per-project screenshot
                  <img
                    key={src}
                    src={src}
                    alt={`${project.title} screenshot`}
                    onClick={() => setLightbox(src)}
                    className="aspect-video w-full cursor-zoom-in rounded border border-border object-cover transition-opacity hover:opacity-90"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </details>

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-[100] flex cursor-zoom-out items-center justify-center bg-black/85 p-6 backdrop-blur-sm"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- full-size preview of the same image */}
          <img
            src={lightbox}
            alt=""
            className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
          />
        </div>
      )}
    </article>
  );
}
