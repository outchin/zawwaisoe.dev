// Re-format every post's Markdown with scripts/lib/normalize-markdown.mjs
// (blank lines between blocks, HTML tables → Markdown tables, columns unwrapped,
// diagram code blocks tagged as text). Safe to run again: unchanged posts are skipped.
//   node --env-file=.env scripts/format-posts.mjs [--dry] [--only slug1,slug2]
//   node --env-file=.env.production.local scripts/format-posts.mjs [--dry]
import { PrismaClient } from "@prisma/client";
import { normalizeMarkdown } from "./lib/normalize-markdown.mjs";

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const onlyIdx = args.indexOf("--only");
const only = onlyIdx >= 0 ? args[onlyIdx + 1]?.split(",").filter(Boolean) : null;

const prisma = new PrismaClient();
const posts = await prisma.post.findMany({
  where: only ? { slug: { in: only } } : undefined,
  select: { slug: true, content: true },
  orderBy: { publishedAt: "asc" },
});

let changed = 0;
for (const { slug, content } of posts) {
  const next = normalizeMarkdown(content);
  if (next === content) continue;
  changed++;
  const emptyDetails = (next.match(/<summary>[^<]*<\/summary>\s*<\/details>/g) ?? []).length;
  console.log(
    `format ${slug}: ${content.split("\n").length} → ${next.split("\n").length} lines` +
      (emptyDetails ? `  (note: ${emptyDetails} empty <details> block(s) — content missing in source)` : ""),
  );
  if (!dry) await prisma.post.update({ where: { slug }, data: { content: next } });
}
console.log(`${changed} of ${posts.length} post(s) ${dry ? "would change" : "updated"}.`);
await prisma.$disconnect();
