// One-off content fix (Nov 2026):
//  - two posts had a publishedAt in the future (from randomize-dates.mjs) → move them into the past
//  - typo in two titles/slugs: "Quoata" → "Quota", "Kuber API Server" → "Kube API Server"
//    (next.config.ts redirects the old slugs)
//  - TLS post: drop the empty "Step-by-Step Process" section
// Safe to run twice. Uses DATABASE_URL from the environment:
//   node --env-file=.env scripts/fix-post-typos-and-dates.mjs [--dry]
//   node --env-file=.env.production.local scripts/fix-post-typos-and-dates.mjs [--dry]
import { PrismaClient } from "@prisma/client";

const dry = process.argv.includes("--dry");
const prisma = new PrismaClient();

const redate = [
  // keep their relative order, both after the latest real post (Nov 23)
  ["aws-networking-internet-gateway-route-table-public-vs-private-subnet", "2026-11-26T09:00:00Z"],
  ["aws-s3-pre-signed-url-upload-architecture", "2026-11-25T09:00:00Z"],
];

const renames = [
  { from: "kuber-api-server", to: "kube-api-server", title: [/Kuber API Server/g, "Kube API Server"] },
  { from: "limitrange-resource-quoata", to: "limitrange-resource-quota", title: [/Quoata/g, "Quota"] },
];

for (const [slug, iso] of redate) {
  const post = await prisma.post.findUnique({ where: { slug }, select: { publishedAt: true } });
  if (!post) { console.log(`skip ${slug}: not found`); continue; }
  if (post.publishedAt && post.publishedAt <= new Date()) { console.log(`ok   ${slug}: already ${post.publishedAt.toISOString()}`); continue; }
  console.log(`date ${slug}: ${post.publishedAt?.toISOString()} → ${iso}`);
  if (!dry) await prisma.post.update({ where: { slug }, data: { publishedAt: new Date(iso) } });
}

for (const { from, to, title: [re, fix] } of renames) {
  const post = await prisma.post.findUnique({ where: { slug: from } });
  if (!post) { console.log(`ok   ${from}: not found (already renamed?)`); continue; }
  const data = {
    slug: to,
    title: post.title.replace(re, fix),
    content: post.content.replace(/Quoata/g, "Quota").replace(/Kuber API Server/g, "Kube API Server"),
    excerpt: post.excerpt?.replace(/Quoata/g, "Quota").replace(/Kuber API Server/g, "Kube API Server") ?? null,
  };
  console.log(`fix  ${from} → ${to}: "${post.title}" → "${data.title}"`);
  if (!dry) await prisma.post.update({ where: { slug: from }, data });
}

// TLS post: its "Step 1–4" toggles were empty (removed by format-posts.mjs), so the
// "Step-by-Step Process" line introducing them is left dangling at the end.
{
  const slug = "tls-in-kubernetes-certificate-creation";
  const post = await prisma.post.findUnique({ where: { slug }, select: { content: true } });
  const content = post?.content
    .replace(/\n*<details>\s*<summary>[^<]*<\/summary>\s*<\/details>/g, "")
    .replace(/\n+📝 Step-by-Step Process\s*$/, "\n");
  if (!post || content === post.content) console.log(`ok   ${slug}: nothing to remove`);
  else {
    console.log(`fix  ${slug}: remove empty "Step-by-Step Process" section`);
    if (!dry) await prisma.post.update({ where: { slug }, data: { content } });
  }
}

await prisma.$disconnect();
