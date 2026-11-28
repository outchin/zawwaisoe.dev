import { prisma } from "@/lib/prisma";
import { AWARD_KINDS } from "@/lib/awards";
import { AwardCards } from "@/components/AwardCards";

const isExpired = (result: string | null) => /expired/i.test(result ?? "");

export async function Awards() {
  const awards = await prisma.award.findMany({
    where: { published: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    select: {
      slug: true,
      kind: true,
      title: true,
      result: true,
      issuer: true,
      date: true,
      description: true,
      images: true,
      credentialUrl: true,
      credentialId: true,
      validUntil: true,
    },
  });
  if (awards.length === 0) return null;

  return (
    <section id="achievements" className="mx-auto max-w-5xl px-6 py-12">
      <h2 className="text-sm font-semibold text-muted">
        <span className="text-accent">$</span> ls ./achievements
      </h2>
      <p className="mt-2 font-sans text-sm text-muted">
        Certifications from my career, and competitions and programs from my student years.
      </p>

      {AWARD_KINDS.map((kind) => {
        // current credentials first, expired ones after them (each group keeps its manual order)
        const items = awards
          .filter((a) => a.kind === kind.slug)
          .sort((a, b) => Number(isExpired(a.result)) - Number(isExpired(b.result)));
        if (items.length === 0) return null;
        return (
          <div key={kind.slug} className="mt-8">
            <h3 className="font-mono text-xs font-semibold uppercase tracking-wide text-foreground">{kind.label}</h3>
            <AwardCards awards={items} columns={3} />
          </div>
        );
      })}
    </section>
  );
}
