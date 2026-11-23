"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export function AdminNav() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="border-b border-border">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4 text-sm">
        <Link href="/admin" className="font-semibold">
          <span className="text-accent">~/</span> admin
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-muted hover:text-foreground">
            Posts
          </Link>
          <Link href="/admin/projects" className="text-muted hover:text-foreground">
            Projects
          </Link>
          <Link href="/admin/awards" className="text-muted hover:text-foreground">
            Awards
          </Link>
          <Link href="/blog" className="text-muted hover:text-foreground">
            View blog
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md border border-border px-3 py-1.5 hover:border-accent hover:text-accent"
          >
            Log out
          </button>
        </div>
      </nav>
    </header>
  );
}
