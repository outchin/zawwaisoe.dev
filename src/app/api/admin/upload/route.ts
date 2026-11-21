import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const MAX_SIZE = 8 * 1024 * 1024;

function safeExt(filename: string, mimeType: string) {
  const fromName = path.extname(filename).toLowerCase();
  if ([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"].includes(fromName)) {
    return fromName;
  }
  const fromMime = mimeType.split("/")[1];
  return fromMime ? `.${fromMime}` : ".png";
}

// Uploads always land on local disk under public/uploads/, so the admin
// panel works fully offline in local dev without needing Vercel Blob
// credentials. When Blob credentials are present, prefer Vercel Blob instead
// so uploads survive read-only/serverless filesystems. Newer Vercel Blob
// stores only set BLOB_STORE_ID and authenticate via the deployment's OIDC
// token; older ones set BLOB_READ_WRITE_TOKEN. @vercel/blob handles both.
const hasBlobCredentials = Boolean(
  process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID,
);
export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image uploads are allowed" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Image is larger than 8MB" }, { status: 400 });
  }

  if (hasBlobCredentials) {
    const { put } = await import("@vercel/blob");
    const blob = await put(file.name, file, {
      access: "public",
      addRandomSuffix: true,
    });
    return NextResponse.json({ url: blob.url });
  }

  const ext = safeExt(file.name, file.type);
  const filename = `${crypto.randomUUID()}${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  return NextResponse.json({ url: `/uploads/${filename}` });
}
