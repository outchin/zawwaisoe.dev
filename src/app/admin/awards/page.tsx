import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/admin/AdminNav";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { AWARD_KINDS } from "@/lib/awards";

export const dynamic = "force-dynamic";

export default async function AdminAwardsDashboard() {
  const awards = await prisma.award.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    select: { id: true, kind: true, title: true, result: true, images: true, published: true },
  });

  return (
    <>
      <AdminNav />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-sm font-semibold text-muted">
            <span className="text-accent">$</span> ls ./awards
          </h1>
          <Link
            href="/admin/awards/new"
            className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
          >
            New entry
          </Link>
        </div>

        {AWARD_KINDS.map((kind) => {
          const items = awards.filter((a) => a.kind === kind.slug);
          return (
            <section key={kind.slug} className="mt-8">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">{kind.label}</h2>
              <div className="mt-2 divide-y divide-border rounded-lg border border-border">
                {items.length === 0 && <p className="p-5 font-sans text-sm text-muted">None yet.</p>}
                {items.map((award) => (
                  <div key={award.id} className="flex items-center justify-between gap-4 p-4 text-sm">
                    <div>
                      <p className="font-medium text-foreground">{award.title}</p>
                      <p className="font-sans text-xs text-muted">
                        {award.published ? "published" : "draft"}
                        {award.result && ` · ${award.result}`} ·{" "}
                        {award.images.length === 0 ? (
                          <span className="text-amber-600">no photos</span>
                        ) : (
                          `${award.images.length} photo${award.images.length > 1 ? "s" : ""}`
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link href={`/admin/awards/${award.id}/edit`} className="text-accent hover:text-accent-hover">
                        Edit
                      </Link>
                      <DeleteButton id={award.id} title={award.title} deleteUrl={`/api/admin/awards/${award.id}`} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </>
  );
}
