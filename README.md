# Ibragim Ibragimov Archive

Personal editorial archive built with Next.js, Convex, Bun, and Turborepo.

This repository contains the public website, a private admin panel, and the shared domain package used by both. The project is designed for publishing essays, notes, archive entries, and curated links with bilingual content support and live updates from Convex.

## What This Project Is

The archive has three main user-facing areas:

- `/` - homepage with the current featured text
- `/archive` - published archive entries
- `/links` - public links page

There is also a private editorial area:

- `/login` - admin authentication
- `/admin` - manage posts and links

Content is stored in Convex. The site renders public pages with Next.js App Router and updates public/admin views in near real time through Convex.

## Core Features

- Public reading experience for essays, notes, and long-form writing
- Bilingual post model with Russian and optional English content
- Private admin panel for managing posts and links
- Real-time sync for homepage, archive list, and links
- Markdown rendering with code highlighting and math support
- Shared internal package for domain logic used across the app

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
├── src/                 # Next.js application
├── convex/              # Convex schema, queries, mutations, auth
├── packages/core/       # Shared domain package
├── scripts/             # Root task wrappers and tooling helpers
├── .env.example         # Safe environment template
├── package.json         # Root scripts and workspace config
└── turbo.json           # Task graph for the repo
```

Important directories inside the app:

- `src/app` - routes, metadata, app shell
- `src/components` - UI for public pages and admin flows
- `src/lib` - shared client/server utilities
- `src/lib/server` - server-side data and auth helpers

## How The Project Is Organized

The repository is root-first:

- the main application lives in the repository root
- `packages/core` contains shared domain utilities such as site config, content helpers, dates, and translation helpers
- Turbo runs build, lint, and typecheck across the root app and workspace package as one graph

Convex data model currently includes:

- `posts` - archive entries and page-like content
- `links` - ordered public links
- `sessions` - admin sessions

## Requirements

- Bun `>= 1.2.21`
- A configured Convex deployment
- A private `.env` file based on `.env.example`

## Environment Setup

1. Copy [`.env.example`](/Users/ibragimibragimov/Eldenlord/Blog/.env.example) to `.env`.
2. Fill in the values for your environment.
3. Keep secrets only in `.env`.

Main variables:

- `NEXT_PUBLIC_SITE_URL` - canonical site URL
- `CONVEX_DEPLOYMENT` - Convex deployment used by CLI/runtime
- `NEXT_PUBLIC_CONVEX_URL` - public Convex endpoint used by the Next.js app
- `ADMIN_EMAIL` - admin login email
- `ADMIN_PASSWORD` - admin login password
- `GEMINI_MODEL` - optional translation model
- `GEMINI_API_KEY` - optional private key for translation features, stored only in `.env`

[`.gitignore`](/Users/ibragimibragimov/Eldenlord/Blog/.gitignore) already ignores private `.env` files and keeps only `.env.example` tracked.

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

# shared package only
bun run build:core
bun run lint:core
bun run typecheck:core
```

## Verification Standard

Before shipping changes, run:

```bash
bun run lint
bun run typecheck
bun run verify
```

This repository treats linting and type safety as part of the normal development flow, not as optional cleanup.

## Notes About Running The Repo

- `bun run dev` starts the root Next.js app through the Turbo task wrapper
- `bun run build`, `bun run lint`, and `bun run typecheck` also go through Turbo
- the app depends on Convex-backed data, so a missing or invalid Convex environment will break public/admin data flows
- CI verifies the repository but does not perform direct Vercel deployment from this repo

## In Short

This project is a production-style personal publishing archive with:

- a public reading surface
- a private editorial admin panel
- Convex as the data/auth backend
- Bun + Turbo for workspace orchestration
- strict lint/typecheck standards before release
