# Ibragim Ibragimov Archive

Personal editorial archive built with Next.js, Convex, Bun, and a production-grade Turborepo workflow.

The application now lives in [`apps/web`](/Users/ibragimibragimov/Eldenlord/Blog/apps/web/package.json). The repository root is the monorepo orchestrator for Turbo, CI, Convex, shared tooling, and environment management.

## Stack

- Next.js 16 App Router
- React 19
- Bun workspaces
- Turborepo
- Convex
- Tailwind CSS 4
- TypeScript
- Biome
- ESLint

## Repository Structure

```text
.
├── apps/
│   └── web/                  # Next.js application workspace
├── convex/                   # Convex schema, queries, mutations, auth
├── convex/_generated/        # Local/generated Convex types (not committed)
├── scripts/                  # Root Turbo task wrappers for repo-level tasks
├── .github/workflows/ci.yml  # Turbo-aware CI
├── .env.example             # Safe environment template
├── package.json             # Workspace root orchestrator
├── turbo.json               # Task graph and cache policy
└── vercel.json              # Turbo-first Vercel build contract
```

Important directories inside the app workspace:

- `apps/web/src/app` - routes, metadata, app shell
- `apps/web/src/components` - UI for public pages and admin flows
- `apps/web/src/lib` - shared application utilities
- `apps/web/src/lib/server` - server-side data and auth helpers
- `apps/web/public` - public assets
- `apps/web/fonts` - local fonts used by the app and OG images

## Why The App Lives In `apps/web`

The repository used to keep the Next.js app in the root and a `packages/core` workspace beside it.

That structure worked, but it forced Turbo to rely on root-special-case tasks for both orchestration and application runtime. After reviewing the graph, `packages/core` turned out to be an app-only abstraction layer rather than a genuinely shared workspace boundary.

So the repository was simplified:

- the Next.js app moved to `apps/web`
- `packages/core` was removed
- app-only utilities were inlined into `apps/web/src/lib`
- the root now does what a workspace root should do: orchestrate tasks, CI, env, and Convex

This is a better fit for a Turbo-first monorepo.

## Turbo Graph

Current meaningful tasks:

- root repo tasks: `//#lint`, `//#typecheck`, `//#clean`
- app tasks: `@archive/web#dev`, `@archive/web#build`, `@archive/web#start`, `@archive/web#lint`, `@archive/web#typecheck`, `@archive/web#clean`

Repository responsibilities are split deliberately:

- root `lint` checks repo files, scripts, and Convex linting
- root `typecheck` checks Convex TypeScript
- app `lint` checks `apps/web`
- app `typecheck` runs Next type generation plus app TypeScript
- app `build` is the production Next.js build

That means `bun run verify` exercises the real production graph:

```text
//#lint
//#typecheck
@archive/web#lint
@archive/web#typecheck
@archive/web#build
```

## Core Features

- Public reading experience for essays, notes, and long-form writing
- Bilingual post model with Russian and optional English content
- Private admin panel for managing posts and links
- Real-time sync for homepage, archive list, and links
- Markdown rendering with code highlighting and math support
- Convex-backed content and session handling

## Requirements

- Bun `>= 1.2.21`
- A configured Convex deployment
- A private `.env` file based on `.env.example`

## Environment Setup

1. Copy [`.env.example`](/Users/ibragimibragimov/Eldenlord/Blog/.env.example) to `.env` in the repository root.
2. Fill in the values for your environment.
3. Keep secrets only in `.env`.

Main variables:

- `NEXT_PUBLIC_SITE_URL` - canonical site URL
- `CONVEX_DEPLOY_KEY` - private Convex deploy key for CI, Vercel, and headless deploys
- `NEXT_PUBLIC_CONVEX_URL` - public Convex endpoint used by the web app
- `ADMIN_EMAIL` - admin login email
- `ADMIN_PASSWORD` - admin login password
- `GEMINI_MODEL` - optional translation model
- `GEMINI_API_KEY` - optional private key for translation features, stored only in `.env`

[`.gitignore`](/Users/ibragimibragimov/Eldenlord/Blog/.gitignore) already ignores private `.env` files, keeps only `.env.example` tracked, and excludes `convex/_generated` from version control.

Important: the canonical way to run the project is from the repository root. Root scripts orchestrate both the app workspace and Convex checks consistently, `apps/web` runtime scripts explicitly load the repository-root `.env*` files, and Convex code generation now runs automatically before app dev/build/typecheck so a fresh clone does not need committed `_generated` artifacts.

## Quick Start

```bash
bun install
bun run dev
```

Then open `http://localhost:3000`.

Useful local routes:

- `http://localhost:3000/`
- `http://localhost:3000/archive`
- `http://localhost:3000/links`
- `http://localhost:3000/login`
- `http://localhost:3000/admin`

For local admin UX review, you can preview the service-unavailable notice without breaking Convex by opening `http://localhost:3000/login?__admin_notice=service-unavailable` or `http://localhost:3000/admin?__admin_notice=service-unavailable`. The preview works only outside production builds.

## Daily Commands

```bash
# development
bun run dev

# production checks
bun run lint
bun run typecheck
bun run build
bun run verify

# affected-only checks
bun run lint:affected
bun run typecheck:affected
bun run verify:affected

# app-only targeting
bun run build:web
bun run lint:web
bun run typecheck:web

# graph and diagnostics
bun run graph:build
bun run ls:affected
bun run devtools

# explicit Convex type generation
bun run convex:codegen
```

## Cache Policy

Turbo caches deterministic work and avoids caching long-running or destructive tasks.

Cached:

- `//#lint`
- `//#typecheck`
- `@archive/web#lint`
- `@archive/web#typecheck`
- `@archive/web#build`

Not cached:

- `@archive/web#dev`
- `@archive/web#start`
- `//#clean`
- `@archive/web#clean`

App build hashing includes:

- `.env*`
- `GEMINI_MODEL`
- `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_SITE_URL`

Repo-level pass-through environment includes:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `CONVEX_DEPLOY_KEY`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`

## Vercel

Vercel should build this repository through Convex so backend deploy, generated types, and app build stay in one contract.

Expected setup:

- Vercel project root directory: repository root
- Vercel build command: `bunx convex deploy --cmd "bun run build:web" --cmd-url-env-var-name NEXT_PUBLIC_CONVEX_URL`
- Vercel install command: `bun install --frozen-lockfile`
- Vercel production environment variables: `CONVEX_DEPLOY_KEY`, `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_SITE_URL`, admin secrets, and optional Gemini secrets

[`vercel.json`](/Users/ibragimibragimov/Eldenlord/Blog/vercel.json) reflects that contract so Vercel deploys Convex first and then builds the Next.js app with the correct public URL injected into the build.

## CI

GitHub Actions lives in [`.github/workflows/ci.yml`](/Users/ibragimibragimov/Eldenlord/Blog/.github/workflows/ci.yml).

Behavior:

- `pull_request`: `bun install --frozen-lockfile`, then `bun run verify:affected`
- `push` to `main`: `bun install --frozen-lockfile`, then `bun run verify`
- `fetch-depth: 0` is enabled for affected graph detection
- remote cache is optional through `TURBO_TEAM` and `TURBO_TOKEN`
- CI does not deploy anything directly to Vercel

The workflow validates the monorepo from the root exactly the same way local production verification does.

## Notes About Convex And CI

Public data and realtime features use Convex when `NEXT_PUBLIC_CONVEX_URL` is available.

For CI and headless build environments, Convex type generation is run locally from source before app build and typecheck. Production deploy environments should still provide `CONVEX_DEPLOY_KEY` so Convex can publish functions and inject the correct runtime URL during deployment.

## Verification Standard

Before shipping changes, run:

```bash
bun run lint
bun run typecheck
bun run verify
```

This repository treats linting, type safety, and Turbo graph health as part of normal development flow, not optional cleanup.
