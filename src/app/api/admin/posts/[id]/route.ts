import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

type Params = { params: Promise<{ id: string }> };

async function uniqueSlug(base: string, excludeId: string) {
  const slug = slugify(base) || "post";
  let candidate = slug;
  let suffix = 2;
  while (true) {
    const existing = await prisma.post.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${slug}-${suffix}`;
    suffix += 1;
  }
}

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ post });
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const title = body?.title?.trim();
  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const published = Boolean(body?.published);
  const slug = body?.slug?.trim()
    ? await uniqueSlug(body.slug.trim(), id)
    : existing.slug;

  const post = await prisma.post.update({
    where: { id },
    data: {
      slug,
      title,
      excerpt: body?.excerpt?.trim() || null,
      content: body?.content ?? "",
      coverImage: body?.coverImage?.trim() || null,
      published,
      publishedAt: published ? existing.publishedAt ?? new Date() : null,
    },
  });

  return NextResponse.json({ post });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  await prisma.post.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
