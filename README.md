# Ibragim Ibragimov Archive

Editorial archive built with Next.js, Convex, Bun, and a root-first Turborepo setup.

The public site lives in the repository root. Shared domain logic lives in `packages/core`. The result is a monorepo without fake `apps/*` nesting and without decorative Turbo config.

## Overview

This project includes:

- a public archive homepage
- an archive index and article pages
- a links page
- a private admin area
- server-side translation helpers for editorial workflow
- Convex-backed content, sessions, and mutations

## Stack

- Next.js 16 App Router
- React 19
- Bun
- Turbopack
- Turborepo
- Convex
- Tailwind CSS 4
- Biome
- ESLint
- Zod
- Gemini API for optional translation

## Repository Layout

```text
.
├── convex/          # Convex schema, queries, mutations, auth helpers
├── fonts/           # Local fonts used by the app and OG images
├── packages/
│   └── core/        # Shared domain package for the monorepo
├── public/          # Static public assets
├── scripts/         # Local development scripts
├── src/             # Next.js app, components, server helpers
├── package.json     # Root app + workspace config
├── turbo.json       # Turborepo task graph
└── vercel.json      # Vercel build commands
```

## Why `packages/core` Exists

`packages/core` is the shared internal package for the repo.

It contains:

- content schemas and shared types
- site config and URL helpers
- date helpers
- translation schemas
- admin auth shared constants
- path normalization helpers
- small shared utilities like `cn()`

In plain terms: it is the shared library of the project.

It also gives Turborepo a real internal workspace dependency, so the repo has an actual task graph instead of one root package pretending to be a monorepo.

## Monorepo Model

This repository is intentionally root-first:

- the app stays in the root
- the shared package lives in `packages/core`
- Turbo orchestrates both the root app and the workspace package

Current Turbo graph:

- root task namespace: `//`
- shared package: `@archive/core`
- root build task: `//#build`
- package build task: `@archive/core#build`
- root build depends on workspace build through topological `^build`

That means Turbo can lint, typecheck, build, and cache the shared package and the root app as one system.

## Scripts

All user-facing scripts are short and single-purpose.

```bash
bun run dev       # start local dev server
bun run build     # direct Next.js production build
bun run release   # Turborepo production build for the full repo
bun run start     # run the production server
bun run lint      # lint the root app
bun run convex    # lint Convex code
bun run typecheck # type-check the root app
bun run verify    # turbo lint + typecheck + build
bun run fix       # apply Biome fixes
bun run format    # format files
bun run clean     # clean build output and turbo artifacts
bun run deploy    # verify turbo tasks, then deploy Convex
```

## Environment

Private environment files are ignored by [`.gitignore`](/Users/ibragimibragimov/Eldenlord/Blog/.gitignore).

- template file: [`.env.example`](/Users/ibragimibragimov/Eldenlord/Blog/.env.example)
- local secrets file: [`.env`](/Users/ibragimibragimov/Eldenlord/Blog/.env)

### Safe to keep in `.env.example`

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

## Local Development

```bash
bun install
bun run dev
```

Before starting the app, make sure your local `.env` has valid Convex values, admin credentials, and optional Gemini credentials.

## Build And Verification

Standard local checks:

```bash
bun run lint
bun run typecheck
bun run build
```

Full monorepo verification:

```bash
bun run verify
```

Full monorepo production build:

```bash
bun run release
```

## Vercel Build Contract

Vercel is configured to build through Turbo, not through a direct `next build`.

See [vercel.json](/Users/ibragimibragimov/Eldenlord/Blog/vercel.json):

```json
{
  "installCommand": "bun install --frozen-lockfile",
  "buildCommand": "bun run release"
}
```

That matters because `bun run release` runs Turbo across the root app and `@archive/core`, which gives you:

- a real workspace build graph
- consistent task ordering
- reusable Turbo cache artifacts
- proper monorepo build logs in CI and Vercel

## Architecture

### Public Runtime

The public site uses Convex as a deliberate realtime content layer.

Pages are server-rendered through Convex reads and then connected to a lightweight live refresh bridge.

Key files:

- `src/lib/server/public-data.ts`
- `src/components/public-realtime-provider.tsx`
- `src/components/public-live-sync.tsx`

### Admin Boundary

The admin UI does not talk to privileged Convex mutations directly from the browser.

Request flow:

```text
Admin UI -> /api/admin/* -> server auth/data helpers -> Convex functions
```

Key files:

- `src/lib/admin-api.ts`
- `src/lib/server/admin-auth.ts`
- `src/lib/server/admin-data.ts`
- `src/app/api/admin/**`
- `convex/posts.ts`
- `convex/links.ts`
- `convex/sessions.ts`

### Session Model

Admin login uses:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

A successful login creates a random session token, stores only its hash in Convex, and places the raw token in an `httpOnly` cookie.

### Translation Boundary

Translation stays server-side.

- route: `/api/translate`
- key: `GEMINI_API_KEY`
- model override: `GEMINI_MODEL`

## Routes

Main routes:

- `/`
- `/archive`
- `/archive/[slug]`
- `/links`
- `/login`
- `/admin`

Admin and API routes are handled inside `src/app/api/**` and `src/app/admin/**`.

## Deployment Notes

This project does not deploy the Next.js app directly from local scripts.

- `deploy` is for Convex deployment after verification
- Vercel build uses `bun run release`
- the root app and `packages/core` are built together by Turbo

## Quick Start

```bash
bun install
cp .env.example .env
bun run verify
bun run dev
```

## Status

Current repo contract is consistent:

- root app in `/`
- shared workspace package in `packages/core`
- Turbo task graph active and verified
- `release` and `verify` are the canonical monorepo commands
