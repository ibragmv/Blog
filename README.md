# Ibragim Ibragimov Archive

Editorial archive built with Next.js App Router, Convex, Bun, Turbo, and Turbopack. The public side is optimized for long-form reading, while the private side covers authoring, links, authentication, and optional RU -> EN translation through Gemini.

## What This App Does

- `/` renders the homepage from the `home` post record
- `/archive` lists published essays and notes
- `/archive/[slug]` renders the full article page with metadata and OG output
- `/links` exposes curated public links
- `/login` and `/admin` power the editorial workflow
- `/api/translate` translates editor content when Gemini is configured

## Stack

- Next.js 16 App Router with React 19
- Bun as the package manager and runtime entrypoint
- Turbopack for development and production builds
- Turbo for orchestration across lint, typecheck, and build
- Convex for content, links, sessions, queries, and mutations
- Tailwind CSS 4 for styling
- Biome for linting and formatting
- Google Gemini for optional translation inside the admin editor

## Environment Contract

Real secrets belong only in [`.env`](./.env). The public template lives in [`.env.example`](./.env.example). The repo already ignores private env files in [`.gitignore`](./.gitignore).

Public template keys in [`.env.example`](./.env.example):

```env
NEXT_PUBLIC_SITE_URL="https://your-domain.example"
CONVEX_DEPLOYMENT="prod:your-production-deployment"
NEXT_PUBLIC_CONVEX_URL="https://your-production-deployment.convex.cloud"
GEMINI_MODEL="gemini-2.5-flash"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="change-me"
NODE_OPTIONS="--no-deprecation"
```

Private-only server secret in [`.env`](./.env):

```env
GEMINI_API_KEY="your-gemini-api-key"
```

Notes:

- `NEXT_PUBLIC_SITE_URL` is used for canonical URLs, metadata, sitemap, and OG generation
- `CONVEX_DEPLOYMENT` is used by Convex CLI workflows
- `NEXT_PUBLIC_CONVEX_URL` is required by the app runtime
- `GEMINI_API_KEY` is only required if you use `/api/translate`
- `GEMINI_MODEL` is optional in practice and falls back to `gemini-2.5-flash`
- `ADMIN_EMAIL` and `ADMIN_PASSWORD` are required for `/login` and `/admin`
- `NODE_OPTIONS="--no-deprecation"` is the current local runtime default

## Local Development

```bash
bun install
bun run dev
```

`bun run dev` starts the Next.js app through Turbopack. Before launching it, make sure your private [`.env`](./.env) is filled with real values that match your active Convex deployment and admin credentials.

## Scripts

```bash
bun run dev        # start Next.js in dev mode with Turbopack
bun run build      # create a production build with Turbopack
bun run start      # run the production build
bun run lint       # biome check
bun run typecheck  # next typegen + tsc
bun run check      # turbo pipeline: lint + typecheck + build
bun run format     # biome format --write
bun run fix        # biome check --write
bun run analyze    # production build with Turbopack analyzer
bun run clean      # remove local build artifacts
bun run deploy     # deploy Convex functions to the configured Convex deployment
```

## Project Shape

- [src/app](./src/app) contains routes, metadata, route handlers, and OG image entries
- [src/components](./src/components) contains public and admin UI
- [src/lib](./src/lib) contains SEO helpers, server utilities, and shared domain logic
- [convex](./convex) contains the schema, queries, mutations, auth helpers, and generated types
- [scripts](./scripts) contains local development helpers

Schema lives in [convex/schema.ts](./convex/schema.ts).

- `posts` stores articles and page-like content such as the homepage
- `links` stores ordered public links
- `sessions` stores hashed admin sessions with expiration timestamps

## Verification

Run the required quality checks:

```bash
bun run lint
bun run typecheck
```

Then smoke-test the main flows:

- `http://localhost:3000/`
- `http://localhost:3000/archive`
- `http://localhost:3000/archive/[slug]`
- `http://localhost:3000/links`
- `http://localhost:3000/login`
- `http://localhost:3000/admin`
