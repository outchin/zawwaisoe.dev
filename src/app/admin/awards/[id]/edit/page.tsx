import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/admin/AdminNav";
import { AwardEditor } from "@/components/admin/AwardEditor";

export const dynamic = "force-dynamic";

export default async function EditAwardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const award = await prisma.award.findUnique({ where: { id } });
  if (!award) notFound();

  return (
    <>
      <AdminNav />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="mb-6 text-sm font-semibold text-muted">
          <span className="text-accent">$</span> edit award
        </h1>
        <AwardEditor mode="edit" award={award} />
      </main>
    </>
  );
}
