# Ibragim Ibragimov Blog

Editorial blog built on Next.js App Router, Convex, Bun, Turbo, and Turbopack. The public site is tuned for long-form reading, while the admin side covers authoring, links, auth, and optional RU -> EN translation.

## Stack

- Next.js 16 App Router with React 19
- Turbopack for local development and production builds
- Turbo for cached orchestration across lint, typecheck, and build
- Convex for content, links, sessions, and admin mutations
- Tailwind CSS 4 for styling
- Biome for formatting and linting
- Google Gemini model integration for optional translation

## Core Flows

- `/` renders the homepage from the `home` post record
- `/blog` lists published posts with previews and search
- `/blog/[slug]` renders full articles with metadata and OG images
- `/links` exposes curated public links
- `/login` and `/admin` provide the editorial workflow
- `/api/translate` can translate titles and markdown inside the editor

## Environment

Use [`.env.example`](/Users/ibragimibragimov/Eldenlord/Blog/.env.example) as the public template and keep real secrets only in `.env`, which is already ignored by [`.gitignore`](/Users/ibragimibragimov/Eldenlord/Blog/.gitignore).

Public template keys:

```env
NEXT_PUBLIC_SITE_URL="https://your-domain.example"
CONVEX_DEPLOYMENT="dev:your-cloud-dev-deployment"
NEXT_PUBLIC_CONVEX_URL="https://your-convex-deployment.convex.cloud"
GEMINI_MODEL="gemini-2.5-flash"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="change-me"
NODE_OPTIONS="--no-deprecation"
```

Local-only secrets that should exist in `.env` but never in `.env.example`:

```env
GEMINI_API_KEY="your-gemini-api-key"
```

## Development

```bash
bun install
bun run dev
```

`bun run dev` starts Next.js through Turbopack. If you also need the Convex worker:

```bash
bun run convex
```

## Scripts

```bash
bun run dev        # Next.js dev server on Turbopack
bun run build      # production build on Turbopack
bun run analyze    # Turbopack bundle analysis output
bun run start      # serve the production build
bun run convex     # Convex dev with env cleanup
bun run lint       # biome check
bun run fix        # biome check with safe writes
bun run format     # biome format
bun run typecheck  # next typegen + tsc
bun run check      # turbo pipeline: lint + typecheck + build
bun run clean      # remove local build artifacts
bun run deploy     # deploy Convex functions only
```

## Project Shape

- [src/app](/Users/ibragimibragimov/Eldenlord/Blog/src/app) contains routes, metadata, route handlers, and OG image entries
- [src/components](/Users/ibragimibragimov/Eldenlord/Blog/src/components) contains public and admin UI
- [src/lib](/Users/ibragimibragimov/Eldenlord/Blog/src/lib) contains SEO, content, server helpers, and shared utilities
- [convex](/Users/ibragimibragimov/Eldenlord/Blog/convex) contains schema, queries, mutations, auth helpers, and generated types
- [scripts](/Users/ibragimibragimov/Eldenlord/Blog/scripts) contains local DX helpers

Schema lives in [schema.ts](/Users/ibragimibragimov/Eldenlord/Blog/convex/schema.ts).

- `posts` stores articles and page-like content such as the homepage
- `links` stores ordered public links
- `sessions` stores hashed admin sessions with expiration

## Verification

Run:

```bash
bun run check
```

Then smoke-test:

- `http://localhost:3000/`
- `http://localhost:3000/blog`
- `http://localhost:3000/blog/[slug]`
- `http://localhost:3000/links`
- `http://localhost:3000/login`
- `http://localhost:3000/admin`
