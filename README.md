# zawwaisoe.dev

Personal developer portfolio. No animation, light theme with an
electric-blue accent. Built to walk recruiters through your local projects
step by step, let people reach you without leaving the page, and publish
short "today I learned" blog posts with images and links.

**Stack:** Next.js (App Router) + TypeScript + Tailwind CSS v4. The
portfolio itself (hero, projects, contact) is fully static — only the blog
needs a backend, which is a small Postgres-backed CMS (Prisma) with a
single-admin login and Vercel Blob for image uploads. Contact form email is
sent client-side via [EmailJS](https://www.emailjs.com/), no server
involved.

## Structure

```
src/
  app/
    layout.tsx                 Root layout, fonts, <Footer>
    page.tsx                    Composes the portfolio sections
    globals.css                  Theme variables (colors, font)
    blog/page.tsx                 Public blog list (published posts only)
    blog/[slug]/page.tsx           Public blog post
    admin/login/page.tsx            Admin login
    admin/page.tsx                   Admin dashboard (list/new/edit/delete)
    admin/posts/new/page.tsx          New post
    admin/posts/[id]/edit/page.tsx     Edit post
    api/admin/...                       Auth + post CRUD + image upload
  components/
    ProjectBar.tsx      Sticky top nav, avatar, resume download, blog link
    Hero.tsx            Name / role / bio / CTAs
    Skills.tsx           Tech stack badges
    Projects.tsx / ProjectCard.tsx   Local project showcase (case-study format)
    Contact.tsx           Email form (EmailJS)
    Footer.tsx            Social links
    Avatar.tsx             Profile photo, falls back to initials
    admin/                  Admin-only UI (nav, post editor, delete button)
  data/
    site.ts             Your name, bio, links, resume filename, EmailJS ids
    projects.ts          Your projects — this is the file to fill in
  lib/
    prisma.ts             Prisma client singleton
    auth.ts                Session token sign/verify (jose)
    slug.ts                  Slug generator
  proxy.ts                Protects /admin/* and /api/admin/* behind login
prisma/
  schema.prisma           Post model
public/
  resume.pdf             Placeholder — replace with your real resume PDF
```

## Getting started

```bash
npm install
cp .env.example .env   # fill in the values — see "Setting up the blog" below
npm run db:migrate      # creates the Post table
npm run dev
```

Open http://localhost:3000.

## Making the portfolio yours

1. **`src/data/site.ts`** — name, role, bio, email, social links, resume
   filename, availability badge text.
2. **`src/data/projects.ts`** — replace the three placeholder projects with
   your real local projects. Each one follows a case-study shape (problem →
   approach → features → challenges → outcome) that expands inline on the
   page — the same structure works well as talking points in an interview.
   Add a `image: "/projects/your-shot.png"` field (drop the file in
   `public/projects/`) to show a screenshot; omit it and the card shows an
   "add a screenshot" placeholder instead.
3. **`public/resume.pdf`** — replace the placeholder file with your actual
   resume. Keep the filename `resume.pdf`, or update `resumeUrl` in
   `site.ts` if you rename it.
4. **Profile photo** — drop a square photo in `public/` (e.g. `avatar.jpg`)
   and set `avatarUrl: "/avatar.jpg"` in `site.ts`. Until then the nav shows
   your initials in a circle instead.

## Setting up the contact form (EmailJS)

The form is wired up but inert until you add EmailJS credentials — it shows
a "not wired up yet" note under the button until then.

1. Create a free account at [emailjs.com](https://www.emailjs.com/).
2. **Email Services** → add a service (e.g. connect your Gmail) → note the
   **Service ID**.
3. **Email Templates** → create a template using `{{name}}`, `{{email}}`,
   and `{{message}}` as variables (these match the form field `name`
   attributes in `Contact.tsx`). Set the template's "To Email" to your own
   address, and optionally set "Reply To" to `{{email}}` so you can reply
   directly. Note the **Template ID**.
4. **Account** → **General** → note your **Public Key**.
5. Fill in the three `NEXT_PUBLIC_EMAILJS_*` values in `.env`, restart
   `npm run dev`. The form should now send real email.

EmailJS's free tier is generous enough for a portfolio's contact volume,
and the public key is safe to expose client-side by design.

## Setting up the blog

The blog is a small CMS: a Postgres `Post` table, a single admin login at
`/admin`, and image uploads via Vercel Blob. All four env vars below go in
`.env` (and later in Vercel's env var settings).

**Right now this repo is wired to a local Postgres running in Docker** (see
`.env` — `DATABASE_URL` points at `localhost:5433`), so the blog works
immediately with `docker start zawwaisoe-blog-db` (or `docker run` again if
you removed the container — see the command in `.env`'s comments) followed
by `npm run dev`. The admin password is currently the temporary value
`changeme123` (see the hash in `.env`) — **change this before deploying
anywhere public**, following step 4 below. Swap `DATABASE_URL` for a real
Vercel Postgres URL whenever you're ready to move off the local container.

1. **Database** — in your Vercel project, go to **Storage → Create Database
   → Postgres** (powered by Neon). Copy the `DATABASE_URL` it gives you into
   `.env`. (Any Postgres works — Neon/Supabase/local — this is just the
   path of least resistance since you're already deploying to Vercel.)
2. **Image uploads** — **Storage → Create Database → Blob**. Copy the
   `BLOB_READ_WRITE_TOKEN` into `.env`.
3. **Session secret** — generate a random secret for signing login
   sessions:
   ```bash
   openssl rand -base64 32
   ```
   Put it in `.env` as `AUTH_SECRET`.
4. **Admin password** — pick a password, then hash it (never store the
   plain password):
   ```bash
   node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"
   ```
   Put the resulting hash in `.env` as `ADMIN_PASSWORD_HASH`.
5. Run the migration to create the `Post` table:
   ```bash
   npm run db:migrate
   ```
6. `npm run dev`, go to `/admin/login`, log in with the password from step 4.

**Writing a post:** `/admin` → **New post**. Title, a Markdown content field
with a live split-pane preview, an "Insert image" button (uploads to Blob
and drops the `![]()` into the content at your cursor), a separate cover
image for the blog list thumbnail, and a Published toggle — drafts stay
hidden from `/blog` until you flip it on. Delete from either the dashboard
or the post editor.

**Useful scripts:** `npm run db:studio` opens Prisma Studio, a GUI for
browsing/editing the database directly. `npm run db:deploy` applies
migrations in production (Vercel runs this automatically on build if you
add it to the build command, or you can run it manually after adding env
vars to Vercel).

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new) — Next.js is
   auto-detected, no config needed.
3. Add the Postgres and Blob stores from the **Setting up the blog** steps
   above directly in the Vercel dashboard (Storage tab) — this
   auto-populates `DATABASE_URL` and `BLOB_READ_WRITE_TOKEN` for you.
4. Add the remaining env vars from your local `.env`
   (`NEXT_PUBLIC_EMAILJS_*`, `AUTH_SECRET`, `ADMIN_PASSWORD_HASH`) in
   **Settings → Environment Variables**.
5. Deploy, then run `npx prisma migrate deploy` once (locally, pointed at
   the production `DATABASE_URL`, or via `vercel env pull` first) to create
   the `Post` table in production.
6. Every push to your default branch redeploys automatically.

## Design notes

- No animation library, no motion — transitions are limited to plain CSS
  hover states. The project case studies expand via the native
  `<details>`/`<summary>` element (instant, no JS needed).
- Theme colors live as CSS variables in `src/app/globals.css`
  (`--accent`, `--background`, etc.) — change them there to retheme
  everything at once.
- The admin area is intentionally minimal (single password, no user
  accounts) since this is a one-person blog, not a multi-author CMS.
