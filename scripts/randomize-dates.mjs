// Spread out blog post publishedAt/createdAt dates across 2026 instead of
// having them clustered on the same import day.
// Usage: node scripts/randomize-dates.mjs [--dry]
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

function loadEnv() {
  const envPath = path.join(ROOT, ".env");
  const text = readFileSync(envPath, "utf8");
  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || line.startsWith("*")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (!(key in process.env)) process.env[key] = val;
  }
}
loadEnv();

const { PrismaClient } = await import(
  path.join(ROOT, "node_modules/@prisma/client/default.js")
);
const prisma = new PrismaClient();

function randomDateIn2026(rng) {
  const start = Date.UTC(2026, 0, 1); // Jan 1 2026
  const end = Math.min(Date.UTC(2026, 11, 31, 23, 59, 59), Date.now()); // never in the future
  const t = start + rng() * (end - start);
  return new Date(t);
}

// Deterministic-ish seeded RNG so re-runs are reproducible if needed.
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

async function run() {
  const dryRun = process.argv.includes("--dry");
  const rng = mulberry32(20260827);

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, slug: true, title: true },
  });

  // Generate distinct dates, sort them so post order (by creation order)
  // still roughly maps to chronological publish order, then shuffle the
  // assignment slightly less rigidly — but keep it simple: assign in
  // ascending date order matching original creation order, spaced apart.
  const dates = posts.map(() => randomDateIn2026(rng)).sort((a, b) => a - b);

  console.log(`Assigning random 2026 dates to ${posts.length} post(s)${dryRun ? " [DRY RUN]" : ""}...\n`);

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const date = dates[i];
    const iso = date.toISOString();
    console.log(`- ${post.slug.padEnd(55)} -> ${iso.slice(0, 10)}`);
    if (!dryRun) {
      await prisma.post.update({
        where: { id: post.id },
        data: { publishedAt: date, createdAt: date },
      });
    }
  }

  await prisma.$disconnect();
  console.log("\nDone.");
}

run();
