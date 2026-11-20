import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { isProjectStatus } from "@/lib/project-status";

export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ projects });
}

async function uniqueSlug(base: string) {
  const slug = slugify(base) || "project";
  let candidate = slug;
  let suffix = 2;
  while (await prisma.project.findUnique({ where: { slug: candidate } })) {
    candidate = `${slug}-${suffix}`;
    suffix += 1;
  }
  return candidate;
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

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const title = body?.title?.trim();

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const status = isProjectStatus(body?.status) ? body.status : "in-progress";
  const slug = await uniqueSlug(body?.slug?.trim() || title);

  const project = await prisma.project.create({
    data: {
      slug,
      title,
      summary: body?.summary?.trim() || "",
      status,
      year: body?.year?.trim() || String(new Date().getFullYear()),
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
      published: body?.published !== undefined ? Boolean(body.published) : true,
      order: Number.isFinite(body?.order) ? Number(body.order) : 0,
    },
  });

  return NextResponse.json({ project }, { status: 201 });
}
