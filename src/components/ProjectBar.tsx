import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { site } from "@/data/site";

const links = [
  { href: "/#projects", label: "projects" },
  // another app behind a rewrite (next.config.ts): plain <a>, not <Link>
  { href: "/labs", label: "labs", external: true },
  { href: "/#achievements", label: "achievements" },
  { href: "/#skills", label: "skills" },
  { href: "/blog", label: "blog" },
  { href: "/#contact", label: "contact" },
];

export function ProjectBar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4 text-sm">
        <Link href="/#top" className="flex items-center gap-2 font-semibold">
          <Avatar className="h-8 w-8 text-xs" />
          <span>{site.handle}</span>
        </Link>

        <ul className="hidden items-center gap-6 text-muted sm:flex">
          {links.map((link) => (
            <li key={link.href}>
              {"external" in link ? (
                <a href={link.href} className="hover:text-foreground">
                  {link.label}
                </a>
              ) : (
                <Link href={link.href} className="hover:text-foreground">
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        <a
          href={site.resumeUrl}
          download={site.resumeFileName}
          className="rounded-md border border-accent px-3 py-1.5 text-accent hover:bg-accent hover:text-accent-foreground"
        >
          Resume
        </a>
      </nav>
    </header>
  );
}
