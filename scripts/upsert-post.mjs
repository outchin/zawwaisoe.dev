// Create or update a blog post from a Markdown file with a simple front matter block.
// Matches on slug, so re-running after an edit updates the post.
//   node --env-file=.env scripts/upsert-post.mjs content/posts/<slug>.md [--dry]
//   node --env-file=.env.production.local scripts/upsert-post.mjs content/posts/<slug>.md
// Front matter keys: slug, title, excerpt, coverImage, category, topic, tags (comma-separated),
// publishedAt (ISO date), published (default true). Images go in public/blog/<slug>/.
import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

const file = process.argv[2];
const dry = process.argv.includes("--dry");
if (!file) throw new Error("usage: upsert-post.mjs <file.md> [--dry]");

const match = readFileSync(file, "utf8").match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
if (!match) throw new Error(`${file}: missing --- front matter ---`);

const meta = Object.fromEntries(
  match[1]
    .split("\n")
    .filter((l) => l.includes(":"))
    .map((l) => [l.slice(0, l.indexOf(":")).trim(), l.slice(l.indexOf(":") + 1).trim()]),
);
for (const key of ["slug", "title", "category"]) if (!meta[key]) throw new Error(`${file}: "${key}" is required`);

const publishedAt = meta.publishedAt ? new Date(meta.publishedAt) : new Date();
if (Number.isNaN(publishedAt.getTime())) throw new Error(`${file}: bad publishedAt "${meta.publishedAt}"`);

const data = {
  title: meta.title,
  excerpt: meta.excerpt || null,
  content: match[2].trim() + "\n",
  coverImage: meta.coverImage || null,
  category: meta.category,
  topic: meta.topic || null,
  tags: (meta.tags ?? "").split(",").map((t) => t.trim()).filter(Boolean),
  published: meta.published !== "false",
  publishedAt,
};

const prisma = new PrismaClient();
const existing = await prisma.post.findUnique({ where: { slug: meta.slug }, select: { id: true } });
console.log(`${existing ? "update" : "create"} ${meta.slug}: "${data.title}" · ${data.category}/${data.topic} · ${publishedAt.toISOString()}`);
if (!dry) await prisma.post.upsert({ where: { slug: meta.slug }, create: { slug: meta.slug, ...data }, update: data });
await prisma.$disconnect();
