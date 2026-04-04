# Ibragim Ibragimov Archive

Editorial archive built with Next.js App Router, Convex, Bun, Turbo, and Turbopack.

The architecture is split on purpose:

- the public site is intentionally live on top of Convex
- the admin surface is intentionally routed through Next.js server handlers
- translation stays server-only and optional

This is not an accidental hybrid. It is the operating model of the app.

## What The App Does

- `/` renders the homepage from the `home` page record
- `/archive` lists published essays and notes
- `/archive/[slug]` renders a full article page with SEO and OG output
- `/links` exposes curated public links
- `/login` and `/admin` power the private editorial workflow
- `/api/translate` translates editor content when Gemini is configured

## Stack

- Next.js 16 App Router with React 19
- Bun as the package manager and runtime entrypoint
- Turbopack for development and production builds
- Turbo for orchestration across lint, typecheck, and build
- Convex for content, links, sessions, public reads, and admin data mutations
- Tailwind CSS 4 for styling
- Biome for repo linting and formatting
- ESLint with Convex rules for Convex function linting
- Google Gemini for optional RU -> EN translation inside admin

## Architecture

### Public Runtime: intentionally live through Convex

The public surface uses Convex as a deliberate realtime layer, not as an implementation leftover.

Public pages fetch their initial data on the server through `fetchQuery`, render as normal Next.js pages, and then attach a small client-side live sync bridge:

- server render: `src/lib/server/public-data.ts`
- client provider: `src/components/public-realtime-provider.tsx`
- live refresh bridge: `src/components/public-live-sync.tsx`

Each public route keeps its SEO-friendly server render, but also subscribes to the corresponding public Convex query. When published content changes, the client detects divergence from the server snapshot and triggers `router.refresh()`.

That choice is intentional because it gives the archive a better publishing model:

- newly published edits appear on the public site without waiting for a redeploy
- homepage, archive list, article pages, and links stay current with the source of truth
- the app avoids webhook glue, manual cache busting, and stale editorial windows
- Convex is only exposed for public read models, not for privileged admin writes

So the public site remains statically cacheable where useful, but it is also operationally live when content changes.

### Admin API: server boundary after the refactor

The admin side no longer treats the browser as a privileged Convex client.

The current request path is:

`admin UI -> /api/admin/* route handlers -> server auth/data helpers -> Convex functions`

Key pieces:

- browser client wrappers: `src/lib/admin-api.ts`
- route handlers: `src/app/api/admin/**`
- auth/session helpers: `src/lib/server/admin-auth.ts`
- admin data bridge: `src/lib/server/admin-data.ts`
- Convex functions: `convex/posts.ts`, `convex/links.ts`, `convex/sessions.ts`

This refactor makes the boundaries explicit:

- the browser talks only to Next.js route handlers for admin work
- route handlers validate payloads and normalize error responses
- session state is stored in an httpOnly cookie in Next.js
- the raw session token is never trusted directly inside the browser
- Convex receives `sessionToken` only from trusted server code
- Convex stores only the token hash in the `sessions` table

Practically, that means:

- public reads can stay live and low-friction
- admin writes stay behind a server-controlled authorization boundary
- auth, validation, and error shaping are centralized in one place

### Session Model

Admin credentials come from environment variables:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Successful sign-in creates a random session token, hashes it with SHA-256, stores the hash in Convex, and sets the unhashed token only in the `archive_admin_session` httpOnly cookie. Session records live in the `sessions` table and expire after seven days.

### Translation Boundary

`/api/translate` is intentionally separate from Convex mutations.

Translation is a server-only helper for the editor:

- requires a valid admin session
- reads `GEMINI_API_KEY` only on the server
- uses `GEMINI_MODEL` when provided, otherwise falls back to `gemini-2.5-flash`

That keeps third-party API usage out of the public runtime and out of the committed env template.

## Data Model

Schema lives in [convex/schema.ts](/Users/ibragimibragimov/Eldenlord/Blog/convex/schema.ts).

- `posts` stores articles and page-like content such as the homepage
- `links` stores ordered public links
- `sessions` stores hashed admin sessions with expiration timestamps

Public Convex queries are read-only and scoped to published content. Admin Convex queries and mutations require a validated `sessionToken`.

## Environment Contract

Private env files are ignored by [`.gitignore`](/Users/ibragimibragimov/Eldenlord/Blog/.gitignore). The committed template is [`.env.example`](/Users/ibragimibragimov/Eldenlord/Blog/.env.example). Real secrets belong only in private [`.env`](/Users/ibragimibragimov/Eldenlord/Blog/.env).

### Safe to commit in `.env.example`

```env
NEXT_PUBLIC_SITE_URL="https://your-domain.example"
CONVEX_DEPLOYMENT="prod:your-production-deployment"
NEXT_PUBLIC_CONVEX_URL="https://your-production-deployment.convex.cloud"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="change-me"
GEMINI_MODEL="gemini-2.5-flash"
NODE_OPTIONS="--no-deprecation"
```

### Private-only in `.env`

```env
GEMINI_API_KEY="your-real-gemini-api-key"
```

Contract notes:

- `NEXT_PUBLIC_SITE_URL` drives canonical URLs, sitemap output, and OG metadata
- `CONVEX_DEPLOYMENT` is required for Convex CLI commands such as `convex deploy`
- `NEXT_PUBLIC_CONVEX_URL` is required by the public Convex client and live sync provider
- `ADMIN_EMAIL` and `ADMIN_PASSWORD` are required for `/login` and `/admin`
- `GEMINI_MODEL` is optional and defaults to `gemini-2.5-flash`
- `GEMINI_API_KEY` is optional overall, but required for `/api/translate`
- API keys are intentionally omitted from `.env.example`

## Local Development

```bash
bun install
bun run dev
```

Before starting the app, create a private `.env` with real values for your active Convex deployment, admin credentials, and optional Gemini key.

## Scripts

```bash
bun run dev          # start Next.js in dev mode with Turbopack
bun run build        # create a production build with Turbopack
bun run start        # serve the production build
bun run lint         # Biome check + Convex ESLint
bun run typecheck    # next typegen + TypeScript checks
bun run check        # Turbo pipeline: lint + typecheck + build
bun run fix          # apply Biome safe fixes
bun run format       # format files with Biome
bun run clean        # remove local build artifacts
bun run deploy       # Turbo-guarded Convex deploy
```

`bun run lint` already includes Convex linting through `bun run lint:convex`. `bun run deploy` affects only Convex functions and does not deploy the Next.js app to Vercel.

## Project Shape

- [src/app](/Users/ibragimibragimov/Eldenlord/Blog/src/app) contains routes, metadata, route handlers, and OG image entries
- [src/components](/Users/ibragimibragimov/Eldenlord/Blog/src/components) contains public and admin UI
- [src/lib](/Users/ibragimibragimov/Eldenlord/Blog/src/lib) contains SEO helpers, server utilities, API clients, and domain logic
- [convex](/Users/ibragimibragimov/Eldenlord/Blog/convex) contains schema, public queries, admin mutations, auth helpers, and generated types
- [scripts](/Users/ibragimibragimov/Eldenlord/Blog/scripts) contains local development helpers

## Verification

Required checks:

```bash
bun run lint
bun run typecheck
bun run check
```

Recommended smoke test:

- `http://localhost:3000/`
- `http://localhost:3000/archive`
- `http://localhost:3000/archive/[slug]`
- `http://localhost:3000/links`
- `http://localhost:3000/login`
- `http://localhost:3000/admin`
