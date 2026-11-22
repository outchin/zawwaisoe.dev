import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { parseTaxonomy } from "@/lib/blog-taxonomy";

export async function GET() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      coverImage: true,
      category: true,
      topic: true,
      tags: true,
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

  const taxonomy = parseTaxonomy(body);
  if ("error" in taxonomy) {
    return NextResponse.json({ error: taxonomy.error }, { status: 400 });
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
      category: taxonomy.category,
      topic: taxonomy.topic,
      tags: taxonomy.tags,
      published,
      publishedAt: published ? new Date() : null,
    },
  });

  return NextResponse.json({ post }, { status: 201 });
}
