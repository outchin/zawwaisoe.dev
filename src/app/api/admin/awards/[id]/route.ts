import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { awardSlug, parseAward } from "@/lib/awards";

type Params = { params: Promise<{ id: string }> };

async function uniqueSlug(base: string, excludeId: string) {
  const slug = awardSlug(base);
  let candidate = slug;
  let suffix = 2;
  while (true) {
    const existing = await prisma.award.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${slug}-${suffix}`;
    suffix += 1;
  }
}

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const award = await prisma.award.findUnique({ where: { id } });
  if (!award) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ award });
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const existing = await prisma.award.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = parseAward(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const award = await prisma.award.update({
    where: { id },
    data: { ...parsed.data, slug: await uniqueSlug(parsed.slugBase, id) },
  });
  return NextResponse.json({ award });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  await prisma.award.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
