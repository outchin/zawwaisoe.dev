import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { awardSlug, parseAward } from "@/lib/awards";

export async function GET() {
  const awards = await prisma.award.findMany({ orderBy: [{ kind: "asc" }, { order: "asc" }, { createdAt: "desc" }] });
  return NextResponse.json({ awards });
}

async function uniqueSlug(base: string) {
  const slug = awardSlug(base);
  let candidate = slug;
  let suffix = 2;
  while (await prisma.award.findUnique({ where: { slug: candidate } })) {
    candidate = `${slug}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = parseAward(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const award = await prisma.award.create({
    data: { ...parsed.data, slug: await uniqueSlug(parsed.slugBase) },
  });
  return NextResponse.json({ award }, { status: 201 });
}
