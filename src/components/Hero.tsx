import { Avatar } from "@/components/Avatar";
import { site } from "@/data/site";

export function Hero() {
  return (
    <section id="top" className="mx-auto max-w-5xl px-6 pt-16 pb-20">
      <p className="mb-4 text-sm text-muted">
        <span className="text-ok">●</span> {site.availability}
      </p>

      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16 shrink-0 border border-border text-xl sm:h-20 sm:w-20" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {site.name}
          </h1>
          <p className="mt-1 text-muted">
            {site.role} · Previously at {site.previouslyAt}
          </p>
        </div>
      </div>

      <p className="mt-6 max-w-2xl text-balance font-sans leading-relaxed text-muted">
        {site.bio}
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3 text-sm">
        <a
          href="#projects"
          className="rounded-md bg-accent px-4 py-2 font-medium text-accent-foreground hover:bg-accent-hover"
        >
          View projects
        </a>
        <a
          href={site.resumeUrl}
          download={site.resumeFileName}
          className="rounded-md border border-border px-4 py-2 text-foreground hover:border-accent hover:text-accent"
        >
          Download resume
        </a>
        <a
          href="#contact"
          className="rounded-md border border-border px-4 py-2 text-foreground hover:border-accent hover:text-accent"
        >
          Get in touch
        </a>
      </div>
    </section>
  );
}
