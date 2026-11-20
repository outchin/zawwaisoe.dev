import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

export async function GET() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      coverImage: true,
      published: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return NextResponse.json({ posts });
}

async function uniqueSlug(base: string) {
  const slug = slugify(base) || "post";
  let candidate = slug;
  let suffix = 2;
  while (await prisma.post.findUnique({ where: { slug: candidate } })) {
    candidate = `${slug}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const title = body?.title?.trim();
  const content = body?.content ?? "";

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const published = Boolean(body?.published);
  const slug = await uniqueSlug(body?.slug?.trim() || title);

  const post = await prisma.post.create({
    data: {
      slug,
      title,
      excerpt: body?.excerpt?.trim() || null,
      content,
      coverImage: body?.coverImage?.trim() || null,
      published,
      publishedAt: published ? new Date() : null,
    },
  });

  return NextResponse.json({ post }, { status: 201 });
}
