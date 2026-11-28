// One-off content fix (Nov 2026):
//  - two posts had a publishedAt in the future (from randomize-dates.mjs) → move them into the past
//  - typo in two titles/slugs: "Quoata" → "Quota", "Kuber API Server" → "Kube API Server"
//    (next.config.ts redirects the old slugs)
//  - TLS post: drop the empty "Step-by-Step Process" section
//  - titles: drop leading emoji; diagram-only posts: add intro text
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

// Titles: drop the leading emoji ("🐳 Kubelet" → "Kubelet") so all titles look the same.
for (const { slug, title } of await prisma.post.findMany({ select: { slug: true, title: true } })) {
  const clean = title.replace(/^(?:\p{Extended_Pictographic}️?\s*)+/u, "");
  if (clean === title) continue;
  console.log(`title ${slug}: "${title}" → "${clean}"`);
  if (!dry) await prisma.post.update({ where: { slug }, data: { title: clean } });
}

// Posts that were only a diagram: add a short intro and summary around the image.
const intros = {
  "docker-deprecation": {
    before: `Kubernetes v1.24 မှာ Docker ကို runtime အဖြစ် ဖြုတ်လိုက်တော့ "Docker မရှိတော့ဘူး" လို့ ထင်ကြတာ များတယ်။ တကယ်တော့ deprecated ဖြစ်သွားတာ Kubernetes ထဲက Docker runtime (dockershim) အပိုင်းပဲ ဖြစ်ပြီး Docker ကို developer tool အနေနဲ့ ဆက်သုံးလို့ ရပါတယ်။

## အဓိကအချက်များ

- **Docker = Developer Tool** — image build တာ၊ local မှာ run တာတွေအတွက် ဆက်သုံးလို့ရတယ်
- **Kubernetes Runtime = containerd** — v1.24 ကစပြီး kubelet က containerd ကို CRI ကနေ တိုက်ရိုက် ချိတ်တယ်
- **Docker Images = Still Work** — OCI standard ဖြစ်လို့ \`docker build\` နဲ့ လုပ်ထားတဲ့ image တွေ containerd မှာ ဆက် run လို့ရတယ်
- Node ပေါ်မှာတော့ \`docker\` command အစား \`nerdctl\` (သို့) \`crictl\` ကို သုံးရတယ်

## Timeline

1. **အစပိုင်း** — Kubernetes က Docker တစ်ခုတည်းကိုပဲ runtime အဖြစ် သုံးနိုင်တယ်
2. **CRI ပေါ်လာတယ်** — Container Runtime Interface နဲ့ OCI standard တွေ ပေါ်လာတယ်
3. **containerd** — Docker ထဲကနေ ခွဲထုတ်ပြီး CRI-compatible runtime ဖြစ်လာတယ်
4. **Kubernetes v1.24** — Docker runtime ကို ဖြုတ်ပြီး containerd ကို တိုက်ရိုက် သုံးတယ်`,
    after: `အသေးစိတ်ကို [Docker Vs ContainerD](/blog/docker-vs-containerd) နဲ့ [Docker Daemon vs nerdctl](/blog/docker-daemon-vs-nerdctl) မှာ ဆက်ဖတ်နိုင်ပါတယ်။`,
  },
  "kubernetes-architecture": {
    before: `\`kubectl apply -f deployment.yaml\` တစ်ကြောင်း ရိုက်လိုက်တဲ့အခါ cluster ထဲမှာ ဘာတွေ ဆက်ဖြစ်သွားလဲဆိုတာကို diagram တစ်ခုနဲ့ ပြထားတာပါ။

## Request တစ်ခုရဲ့ ခရီးစဉ်

1. **User Input** — \`kubectl\` က request ကို API Server ဆီ ပို့တယ်
2. **API Server** — Authentication၊ Authorization နဲ့ Validation စစ်တယ်
3. **Deployment** — ဖြစ်စေချင်တဲ့ desired state (ဥပမာ \`replicas: 3\`၊ \`strategy: RollingUpdate\`) ကို သတ်မှတ်တယ်
4. **ReplicaSet** — desired နဲ့ current Pod အရေအတွက် တူနေအောင် ထိန်းတယ်
5. **Pod** — Scheduler က node ရွေးပေးပြီး အဲဒီ node ပေါ်က kubelet က container runtime နဲ့ run တယ်`,
    after: `Component တစ်ခုချင်းစီအကြောင်းကို [Kube API Server](/blog/kube-api-server)၊ [Pods, ReplicaSet & Deployment](/blog/pods-replicaset-deployment) နဲ့ [Kubernetes Scheduler](/blog/kubernetes-scheduler) မှာ ဆက်ဖတ်နိုင်ပါတယ်။`,
  },
};
for (const [slug, { before, after }] of Object.entries(intros)) {
  const post = await prisma.post.findUnique({ where: { slug }, select: { content: true } });
  if (!post) { console.log(`skip ${slug}: not found`); continue; }
  const image = post.content.trim();
  if (!/^!\[[^\]]*\]\([^)]*\)$/.test(image)) { console.log(`ok   ${slug}: already has text`); continue; }
  console.log(`text ${slug}: add intro + summary around the diagram`);
  if (!dry) await prisma.post.update({ where: { slug }, data: { content: `${before}\n\n${image}\n\n${after}\n` } });
}

await prisma.$disconnect();
