# Ibragim Ibragimov Blog

Personal website built on Next.js App Router with a Convex backend, Markdown-based content, bilingual post translation via Gemini, and a private admin dashboard for managing posts and links.

## Stack

- Next.js 16 + React 19
- Convex for content and admin session storage
- Tailwind CSS 4
- Biome for linting and formatting
- Turbo for combined project checks
- Gemini API for RU -> EN translation inside the admin panel

## What is in the app

- `/` renders the home page content from the `posts` collection using the `home` slug
- `/blog` shows published posts
- `/blog/[slug]` renders a single post
- `/links` shows public links
- `/login` handles admin authentication
- `/admin` manages posts and links
- `/api/admin/session` issues and clears admin sessions
- `/api/translate` translates title and Markdown content from Russian to English

## Environment

Copy `.env.example` to `.env` and fill in the values.

```env
NEXT_PUBLIC_SITE_URL="https://your-domain.example"
CONVEX_DEPLOYMENT="dev:your-cloud-dev-deployment"
NEXT_PUBLIC_CONVEX_URL="https://your-production-deployment.convex.cloud"
GEMINI_API_KEY="your-gemini-api-key"
GEMINI_MODEL="choose-your-model"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="change-me"
NODE_OPTIONS="--no-deprecation"
```

Notes:

- `CONVEX_DEPLOYMENT` is used by local Convex CLI workflows such as `bun run convex:dev`
- `NEXT_PUBLIC_CONVEX_URL` is the Convex deployment the running Next.js app talks to
- `NEXT_PUBLIC_SITE_URL` is used for metadata, canonical URLs, sitemap, and OG generation
- `GEMINI_API_KEY` and `GEMINI_MODEL` are only needed for the translation endpoint
- `ADMIN_EMAIL` and `ADMIN_PASSWORD` are used by the private admin login flow

## Local development

1. Install dependencies:

```bash
bun install
```

2. Create `.env` from `.env.example`.

3. Start the app:

```bash
bun run dev
```

4. If you need Convex local tooling or want to attach the CLI to a dev deployment, run:

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

## Data model

Defined in [convex/schema.ts](/Users/ibragimibragimov/Eldenlord/Blog/convex/schema.ts).

- `posts`: blog posts and page-like content, including the home page entry
- `links`: public social and external links with manual ordering
- `sessions`: hashed admin sessions with expiration timestamps

Post documents include bilingual fields for title and content, plus publication and page flags.

## Admin flow

The admin panel authenticates against `ADMIN_EMAIL` and `ADMIN_PASSWORD`. After login, the app creates a server-issued session, stores it in Convex, and mirrors access through an HttpOnly cookie and a short-lived session token.

## Verification

Run the core checks locally:

```bash
bun run lint
bun run typecheck
bun run build
```

Then verify these routes manually:

- `http://localhost:3000/`
- `http://localhost:3000/blog`
- `http://localhost:3000/links`
- `http://localhost:3000/login`
- `http://localhost:3000/admin`
