# Ibragim Ibragimov Blog

Monochrome long-form blog built with Next.js App Router and Convex. Public pages are tuned for reading first, while the private admin area handles posts, links, and translation workflows.

## Stack

- Next.js 16 + React 19
- Convex for content, sessions, and admin data
- Tailwind CSS 4 for the UI system
- Biome for linting and formatting
- Turbo for combined project checks
- Gemini-powered translation inside the admin flow

## Routes

- `/` renders the home page content from the `home` post
- `/blog` lists published writing
- `/blog/[slug]` renders a single article
- `/links` renders public links
- `/login` handles admin authentication
- `/admin` manages posts and links
- `/api/admin/session` creates and clears admin sessions
- `/api/translate` translates title and markdown content from Russian to English

## Environment Setup

Use `.env.example` as the publish-safe template, then keep all real secrets only in your private `.env`.

```env
NEXT_PUBLIC_SITE_URL="https://your-domain.example"
CONVEX_DEPLOYMENT="dev:your-cloud-dev-deployment"
NEXT_PUBLIC_CONVEX_URL="https://your-production-deployment.convex.cloud"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="change-me"
NODE_OPTIONS="--no-deprecation"
```

Private-only additions for `.env`:

- `GEMINI_API_KEY`
- `GEMINI_MODEL`

Variable notes:

- `NEXT_PUBLIC_SITE_URL` drives metadata, canonical URLs, sitemap, and OG output
- `CONVEX_DEPLOYMENT` is used by local Convex CLI workflows such as `bun run convex:dev`
- `NEXT_PUBLIC_CONVEX_URL` is the runtime endpoint used by the app
- `ADMIN_EMAIL` and `ADMIN_PASSWORD` protect the private admin flow
- Gemini variables are only required if you use the translation endpoint

## Local Development

```bash
bun install
bun run dev
```

If you need Convex tooling during development:

```bash
bun run convex:dev
```

## Scripts

```bash
bun run dev
bun run build
bun run start
bun run preview
bun run lint
bun run lint:fix
bun run format
bun run typecheck
bun run check
bun run convex:dev
bun run convex:deploy
```

## Content Model

Schema lives in [schema.ts](/Users/ibragimibragimov/Eldenlord/Blog/convex/schema.ts).

- `posts` stores blog posts and page-like content, including the home page entry
- `links` stores public external links with manual ordering
- `sessions` stores hashed admin sessions with expiration timestamps

Each post can hold bilingual title/content fields plus publication and page flags.

## Verification

Run the core checks:

```bash
bun run lint
bun run typecheck
bun run build
```

Then manually verify:

- `http://localhost:3000/`
- `http://localhost:3000/blog`
- `http://localhost:3000/blog/[slug]`
- `http://localhost:3000/links`
- `http://localhost:3000/login`
- `http://localhost:3000/admin`
