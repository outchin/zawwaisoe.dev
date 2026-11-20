import { site } from "@/data/site";

export function Skills() {
  return (
    <section id="skills" className="mx-auto max-w-5xl px-6 py-12">
      <h2 className="text-sm font-semibold text-muted">
        <span className="text-accent">$</span> tech-stack --list
      </h2>
      <ul className="mt-4 flex flex-wrap gap-2">
        {site.skills.map((skill) => (
          <li
            key={skill}
            className="rounded-md border border-border px-3 py-1 text-sm text-foreground"
          >
            {skill}
          </li>
        ))}
      </ul>
    </section>
  );
}
