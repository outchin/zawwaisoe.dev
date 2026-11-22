import { labs } from "@/data/labs";

// Links are plain <a>: /labs/* is another app behind a rewrite, so Next's <Link>
// (prefetch + soft navigation) must not handle them.
export function Labs() {
  return (
    <section id="labs" className="mx-auto max-w-5xl px-6 py-12">
      <h2 className="text-sm font-semibold text-muted">
        <span className="text-accent">$</span> ls ./labs
      </h2>
      <p className="mt-2 font-sans text-sm text-muted">
        Backend experiments run for real: theory first, then real requests, the server&apos;s own
        trace and MySQL read back. Every number on a lab page is measured.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {labs.map((lab) => (
          <a
            key={lab.path}
            href={lab.path}
            className="group rounded-lg border border-border bg-background-elevated p-5 hover:border-accent"
          >
            <p className="text-xs text-muted">Lab {lab.no}</p>
            <h3 className="mt-1 font-semibold text-foreground group-hover:text-accent">{lab.title}</h3>
            <p className="mt-1 font-sans text-sm text-muted">{lab.question}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {lab.stack.map((tech) => (
                <span key={tech} className="rounded border border-border px-2 py-0.5 text-xs text-accent">
                  {tech}
                </span>
              ))}
            </div>
          </a>
        ))}
      </div>

      <p className="mt-4 text-sm">
        <a href="/labs" className="text-accent hover:underline">
          all labs →
        </a>
      </p>
    </section>
  );
}
