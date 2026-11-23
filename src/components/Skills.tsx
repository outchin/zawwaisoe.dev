import { site } from "@/data/site";

export function Skills() {
  return (
    <section id="skills" className="mx-auto max-w-5xl px-6 py-12">
      <h2 className="text-sm font-semibold text-muted">
        <span className="text-accent">$</span> tech-stack --list
      </h2>
      <dl className="mt-6 space-y-5">
        {site.skills.map(({ group, items }) => (
          <div key={group} className="grid gap-2 sm:grid-cols-[11rem_1fr] sm:gap-4">
            <dt className="pt-1 font-mono text-xs font-semibold uppercase tracking-wide text-foreground">{group}</dt>
            <dd>
              <ul className="flex flex-wrap gap-2">
                {items.map((skill) => (
                  <li key={skill} className="rounded-md border border-border px-3 py-1 text-sm text-foreground">
                    {skill}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
