import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { isProjectStatus } from "@/lib/project-status";

type Params = { params: Promise<{ id: string }> };

async function uniqueSlug(base: string, excludeId: string) {
  const slug = slugify(base) || "project";
  let candidate = slug;
  let suffix = 2;
  while (true) {
    const existing = await prisma.project.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${slug}-${suffix}`;
    suffix += 1;
  }
}

function parseListField(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/\r?\n|,/)
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ project });
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const title = body?.title?.trim();
  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const status = isProjectStatus(body?.status) ? body.status : existing.status;
  const slug = body?.slug?.trim() ? await uniqueSlug(body.slug.trim(), id) : existing.slug;

  const project = await prisma.project.update({
    where: { id },
    data: {
      slug,
      title,
      summary: body?.summary?.trim() || "",
      status,
      year: body?.year?.trim() || existing.year,
      stack: parseListField(body?.stack),
      image: body?.image?.trim() || null,
      screenshots: parseListField(body?.screenshots),
      problem: body?.problem?.trim() || "",
      approach: body?.approach?.trim() || "",
      features: parseListField(body?.features),
      challenges: body?.challenges?.trim() || "",
      outcome: body?.outcome?.trim() || "",
      githubUrl: body?.githubUrl?.trim() || null,
      liveUrl: body?.liveUrl?.trim() || null,
      published: body?.published !== undefined ? Boolean(body.published) : existing.published,
      order: Number.isFinite(body?.order) ? Number(body.order) : existing.order,
    },
  });

  return NextResponse.json({ project });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  await prisma.project.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
