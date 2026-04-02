# Ibragim Ibragimov Blog

Minimal editorial blog built with Next.js App Router, Convex, Bun, and Turbo. The public side is optimized for long-form reading, while the private admin panel handles posts, links, authentication, and optional RU -> EN translation.

## Stack

- Next.js 16 + React 19
- Convex for posts, links, sessions, and admin mutations
- Tailwind CSS 4 for styling
- Biome for linting and formatting
- Turbo for project-wide checks
- Google Gemini for optional translation inside the editor

## Features

- Home page content is sourced from the `home` post record
- `/blog` lists published posts with previews and search
- `/blog/[slug]` renders full articles with OG images and SEO metadata
- `/links` exposes curated public links
- `/login` and `/admin` provide a private editorial workflow
- `/api/translate` can translate post title and markdown from Russian to English

## Environment

Copy [`.env.example`](/Users/ibragimibragimov/Eldenlord/Blog/.env.example) to `.env`. The files should have the same keys and section order; `.env.example` must contain only placeholders, never real secrets.

```env
NEXT_PUBLIC_SITE_URL="https://your-domain.example"
CONVEX_DEPLOYMENT="dev:your-cloud-dev-deployment"
NEXT_PUBLIC_CONVEX_URL="https://your-deployment.convex.cloud"
GEMINI_API_KEY="your-gemini-api-key"
GEMINI_MODEL="gemini-2.5-flash"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="change-me"
NODE_OPTIONS="--no-deprecation"
```

Notes:

- `NEXT_PUBLIC_SITE_URL` drives canonical URLs, sitemap, metadata, and OG output
- `CONVEX_DEPLOYMENT` is used by the local Convex CLI workflow
- `NEXT_PUBLIC_CONVEX_URL` is required by both the app and admin data layer
- `GEMINI_API_KEY` enables translation requests in `/api/translate`
- `GEMINI_MODEL` controls the Gemini model used by the editor translation flow
- `ADMIN_EMAIL` and `ADMIN_PASSWORD` protect the admin session flow
- `NODE_OPTIONS="--no-deprecation"` keeps Bun/Next output quieter in local workflows

## Development

```bash
bun install
bun run dev
```

If you also need the Convex dev process:

```bash
bun run convex
```

## Scripts

```bash
bun run dev        # start Next.js in development
bun run convex     # run Convex dev with env cleanup
bun run build      # production build
bun run start      # serve the production build
bun run lint       # biome check
bun run fix        # biome check with safe writes
bun run format     # biome format
bun run typecheck  # next typegen + tsc
bun run check      # turbo lint + typecheck + build
bun run clean      # remove local build artifacts
bun run deploy     # deploy Convex functions only
```

## Project Shape

- [src/app](/Users/ibragimibragimov/Eldenlord/Blog/src/app) contains routes, metadata, API handlers, and OG image entries
- [src/components](/Users/ibragimibragimov/Eldenlord/Blog/src/components) contains UI for the public site and admin
- [src/lib](/Users/ibragimibragimov/Eldenlord/Blog/src/lib) contains content helpers, SEO, theme logic, and server utilities
- [convex](/Users/ibragimibragimov/Eldenlord/Blog/convex) contains schema, queries, mutations, auth helpers, and generated types
- [scripts](/Users/ibragimibragimov/Eldenlord/Blog/scripts) contains local DX helpers for typecheck and Convex dev

Schema lives in [schema.ts](/Users/ibragimibragimov/Eldenlord/Blog/convex/schema.ts).

- `posts` stores articles and page-like content such as the home page
- `links` stores ordered public links
- `sessions` stores hashed admin sessions with expiration

## Verification

Run:

```bash
bun run check
```

Then verify these routes locally:

- `http://localhost:3000/`
- `http://localhost:3000/blog`
- `http://localhost:3000/blog/[slug]`
- `http://localhost:3000/links`
- `http://localhost:3000/login`
- `http://localhost:3000/admin`
