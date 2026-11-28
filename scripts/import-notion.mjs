// Import blog post content from Notion into the local Postgres DB.
// Usage: node scripts/import-notion.mjs [--dry] [--only slug1,slug2]
import { execSync } from "node:child_process";
import { readFileSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// Load .env manually (no dotenv dep needed for this standalone script)
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

// slug (matches DB) -> Notion page id
const POSTS = [
  ["docker-vs-containerd", "30242ac5-e9dd-8092-93d4-caa84be33e5c"],
  ["kubernetes-architecture-summary", "30242ac5-e9dd-817e-b6d1-c67c18aa223d"],
  ["etcd", "30342ac5-e9dd-8027-bdb6-fbc45e2ec948"],
  ["docker-deprecation", "30342ac5-e9dd-80de-94cb-d34ec0ccb548"],
  ["kube-api-server", "30342ac5-e9dd-8046-98a5-cd7208868833"],
  ["docker-sharing-kernel-concept", "30342ac5-e9dd-813e-a92b-ca26c7eda0ba"],
  ["kubernetes-scheduler", "30342ac5-e9dd-8147-855f-e75b48261b08"],
  ["kubelet", "30342ac5-e9dd-8119-9527-d384e26a18f3"],
  ["taints-tolerations", "30442ac5-e9dd-8185-a295-ce87e54fceb9"],
  ["gitops-argocd-flux", "30442ac5-e9dd-81e2-a2db-de5cfedcdf6c"],
  ["docker-daemon-vs-nerdctl", "30442ac5-e9dd-81d4-9406-d279bad64cfc"],
  ["network-interfaces-port-binding", "30442ac5-e9dd-81ae-948d-cfe189cb8d22"],
  ["lazy-pulling-p2p-image-distribution", "30442ac5-e9dd-81d6-9281-ff9457944a4e"],
  ["oci-standard-open-container-initiative", "30442ac5-e9dd-8156-9fa2-f8a59dcb8e57"],
  ["pods-replicaset-deployment", "30442ac5-e9dd-81a6-93b9-e64622966611"],
  ["kubernetes-architecture", "30442ac5-e9dd-800b-97ff-f63c6bfc13e0"],
  ["kubernetes-scheduler-plugins-profiles", "31642ac5-e9dd-81b1-8069-f431d4cdfefd"],
  ["resources-requests-limits", "31842ac5-e9dd-8022-8ba6-ed6d96098310"],
  ["limitrange-resource-quota", "31a42ac5-e9dd-80fd-a5a7-c36f5865534e"],
  ["kubernetes-scheduling-concepts", "31c42ac5-e9dd-80fb-a66b-f4f833346092"],
  ["tls-in-kubernetes-certificate-creation", "31e42ac5-e9dd-80eb-accb-f2bd43528df5"],
  ["tls-certificates-step-by-step-guide", "31e42ac5-e9dd-81ed-9c13-cbcad24646d8"],
  ["kubernetes-authorization-complete-guide", "32042ac5-e9dd-81c6-950e-cad5c9482f7b"],
  ["kubernetes-jobs", "32642ac5-e9dd-8184-9c47-ef438bae326c"],
  ["aws-s3-pre-signed-url-upload-architecture", "32c42ac5-e9dd-81e4-aa76-c57e46774175"],
  [
    "aws-networking-internet-gateway-route-table-public-vs-private-subnet",
    "37e42ac5-e9dd-8124-b1c6-fb237cce0749",
  ],
  ["ssh-copy-id", "29c42ac5-e9dd-806c-b5ea-cfe0b6d4135f"],
];

function getNotionMarkdown(pageId) {
  const out = execSync(`ntn pages get ${pageId} --json`, {
    maxBuffer: 1024 * 1024 * 20,
  }).toString("utf8");
  const data = JSON.parse(out);
  return data.markdown.markdown;
}

// Strip/convert Notion-specific markdown extensions into plain Markdown
// that react-markdown + remark-gfm + rehype-raw can render.
function cleanMarkdown(md) {
  let text = md;

  // Remove empty block placeholders
  text = text.replace(/<empty-block\/>\n?/g, "");

  // <span color="...">content</span> -> content (repeat for nesting)
  for (let i = 0; i < 5; i++) {
    text = text.replace(/<span color="[^"]*">([\s\S]*?)<\/span>/g, "$1");
  }

  // Trailing block color annotation e.g. `{color="blue_bg"}` at end of heading lines
  text = text.replace(/\s*\{color="[^"]*"\}/g, "");

  // <callout icon="..." color="...">\n\tcontent\n</callout> -> blockquote
  text = text.replace(
    /<callout icon="([^"]*)"(?: color="[^"]*")?>\n?([\s\S]*?)\n?<\/callout>/g,
    (_m, icon, body) => {
      const lines = body
        .split("\n")
        .map((l) => l.replace(/^\t/, "").trim())
        .filter((l) => l.length > 0);
      if (lines.length === 0) return "";
      return `> ${icon} ${lines.join("\n> ")}`;
    }
  );

  // Internal notion cross-links to other pages/databases -> drop (not public)
  text = text.replace(/<page url="[^"]*">([\s\S]*?)<\/page>/g, "**$1**");
  text = text.replace(/<database[^>]*>([\s\S]*?)<\/database>/g, "**$1**");

  // Table header-row attr isn't standard HTML but harmless; leave <table> as-is
  // since rehype-raw passes raw HTML through.

  // Collapse 3+ blank lines
  text = text.replace(/\n{3,}/g, "\n\n");

  return text.trim();
}

function extractImages(md) {
  const regex = /!\[([^\]]*)\]\((https:\/\/prod-files-secure[^\s)]+)\)/g;
  const images = [];
  let m;
  while ((m = regex.exec(md))) {
    images.push({ alt: m[1], url: m[2], full: m[0] });
  }
  return images;
}

function extFromUrl(url) {
  const clean = url.split("?")[0];
  const ext = path.extname(clean).toLowerCase();
  if ([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"].includes(ext)) {
    return ext;
  }
  return ".png";
}

async function downloadImages(md, slug, dryRun) {
  const images = extractImages(md);
  if (images.length === 0) return md;

  const dir = path.join(ROOT, "public", "blog", slug);
  if (!dryRun) mkdirSync(dir, { recursive: true });

  let text = md;
  let idx = 1;
  for (const img of images) {
    // Find next available image-N filename that doesn't collide
    let filename;
    let ext = extFromUrl(img.url);
    do {
      filename = `image-${idx}${ext}`;
      idx += 1;
    } while (existsSync(path.join(dir, filename)));

    const localPath = `/blog/${slug}/${filename}`;
    if (!dryRun) {
      try {
        const res = await fetch(img.url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buf = Buffer.from(await res.arrayBuffer());
        writeFileSync(path.join(dir, filename), buf);
      } catch (err) {
        console.error(`  ! image download failed (${slug}): ${err.message}`);
        continue;
      }
    }
    const altText = img.alt || slug;
    text = text.replace(img.full, `![${altText}](${localPath})`);
  }
  return text;
}

async function run() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry");
  const onlyArg = args.find((a) => a.startsWith("--only"));
  const only = onlyArg
    ? (args[args.indexOf(onlyArg) + 1] || "").split(",").filter(Boolean)
    : null;

  const targets = only ? POSTS.filter(([slug]) => only.includes(slug)) : POSTS;

  console.log(`Importing ${targets.length} post(s)${dryRun ? " [DRY RUN]" : ""}...\n`);

  for (const [slug, pageId] of targets) {
    process.stdout.write(`- ${slug} ... `);
    try {
      const raw = getNotionMarkdown(pageId);
      let cleaned = cleanMarkdown(raw);
      cleaned = await downloadImages(cleaned, slug, dryRun);

      if (dryRun) {
        console.log(`OK (${cleaned.length} chars, dry run — no DB write)`);
        continue;
      }

      const result = await prisma.post.updateMany({
        where: { slug },
        data: { content: cleaned },
      });
      if (result.count === 0) {
        console.log("SKIPPED (no matching post in DB)");
      } else {
        console.log(`OK (${cleaned.length} chars)`);
      }
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
    }
  }

  await prisma.$disconnect();
  console.log("\nDone.");
}

run();
