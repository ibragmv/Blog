# Ibragim Ibragimov Archive

Root-first editorial archive built with Next.js 16, Bun, Convex, and Turborepo.

The public app lives in the repository root. Shared domain code lives in [`packages/core`](/Users/ibragimibragimov/Eldenlord/Blog/packages/core/package.json). Turbo orchestrates both as one graph instead of treating the monorepo as a release-only wrapper.

## Stack

- Next.js 16 App Router
- React 19
- Bun workspaces
- Turborepo
- Convex
- Tailwind CSS 4
- Biome
- ESLint
- TypeScript

## Repository Shape

```text
.
├── .github/workflows/ci.yml   # Turbo-aware CI
├── convex/                    # Convex schema, auth, queries, mutations
├── packages/core/             # Shared internal domain package
├── scripts/                   # Local wrappers for Turbo-first root tasks
├── src/                       # Root Next.js application
├── package.json               # Root app + workspace scripts
├── turbo.json                 # Task graph, cache policy, env contract
└── vercel.json                # Build contract only, not a deploy workflow
```

## Turbo Graph

This repository is intentionally root-first.

- Root app: `//`
- Shared package: `@archive/core`
- Root tasks: `//#dev`, `//#build`, `//#lint`, `//#typecheck`, `//#start`, `//#clean`
- Workspace tasks: `@archive/core#build`, `@archive/core#lint`, `@archive/core#typecheck`, `@archive/core#clean`

Build, lint, and typecheck all run topologically:

```text
@archive/core#build      -> //#build
@archive/core#lint       -> //#lint
@archive/core#typecheck  -> //#typecheck
```

The important detail is the root wrapper in [`scripts/turbo-task.mjs`](/Users/ibragimibragimov/Eldenlord/Blog/scripts/turbo-task.mjs):

- `bun run build` starts `bunx turbo run build --filter=//`
- when Turbo executes the root task internally, the wrapper detects `TURBO_HASH` and runs the real command directly
- this keeps `bun run build` Turbo-first without creating recursive `turbo -> bun run build -> turbo` loops

## Daily Commands

```bash
bun install

# local development
bun run dev

# full root app flow through Turbo
bun run lint
bun run typecheck
bun run build
bun run verify

# incremental CI-style flow
bun run verify:affected

# targeted workspace operations
bun run build:core
bun run lint:core
bun run typecheck:core

# graph and diagnostics
bun run graph:build
bun run ls:affected
bun run devtools
```

## Cache Policy

Turbo is configured to cache only tasks that benefit from deterministic replay.

Cached:

- `//#build`
- `//#lint`
- `//#typecheck`
- `@archive/core#build`
- `@archive/core#lint`
- `@archive/core#typecheck`

Not cached:

- `//#dev`
- `//#start`
- `//#clean`
- `dev`
- `start`
- `clean`

Root typecheck declares [`.next/types/**`](/Users/ibragimibragimov/Eldenlord/Blog/.next/types) and [`.next/dev/types/**`](/Users/ibragimibragimov/Eldenlord/Blog/.next/dev/types) as outputs because `next typegen` generates those artifacts before `tsc` runs. That keeps the cache model honest instead of pretending the task is output-free.

## Environment Contract

Global cache inputs:

- [`.env.example`](/Users/ibragimibragimov/Eldenlord/Blog/.env.example)
- [`biome.json`](/Users/ibragimibragimov/Eldenlord/Blog/biome.json)
- [`bun.lock`](/Users/ibragimibragimov/Eldenlord/Blog/bun.lock)
- [`eslint.config.mjs`](/Users/ibragimibragimov/Eldenlord/Blog/eslint.config.mjs)
- [`next.config.ts`](/Users/ibragimibragimov/Eldenlord/Blog/next.config.ts)
- [`package.json`](/Users/ibragimibragimov/Eldenlord/Blog/package.json)
- [`postcss.config.mjs`](/Users/ibragimibragimov/Eldenlord/Blog/postcss.config.mjs)
- [`tsconfig.json`](/Users/ibragimibragimov/Eldenlord/Blog/tsconfig.json)
- [`turbo.json`](/Users/ibragimibragimov/Eldenlord/Blog/turbo.json)
- [`vercel.json`](/Users/ibragimibragimov/Eldenlord/Blog/vercel.json)

Global hashed environment:

- `CI`
- `NODE_ENV`

Root build hashed environment:

- `GEMINI_MODEL`
- `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_SITE_URL`

Root `dev` and `start` pass runtime-only environment through Turbo without caching:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `CONVEX_DEPLOYMENT`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_SITE_URL`

Important: `.env` is no longer a global Turbo dependency. Only the root build task hashes `.env*`. That means changing a secret does not unnecessarily invalidate `@archive/core` lint and typecheck caches.

## Remote Cache

Local cache works out of the box in [`.turbo/`](/Users/ibragimibragimov/Eldenlord/Blog/.turbo).

Remote cache is intentionally wired by environment, not by hardcoded config:

- `TURBO_TEAM`
- `TURBO_TOKEN`

If those variables are present in CI or in your shell, Turbo uses remote cache automatically. If they are absent, the repo still works with local cache only.

## CI

GitHub Actions lives in [`.github/workflows/ci.yml`](/Users/ibragimibragimov/Eldenlord/Blog/.github/workflows/ci.yml).

Behavior:

- `pull_request`: `bun install --frozen-lockfile`, then `bun run verify:affected`
- `push` to `main`: `bun install --frozen-lockfile`, then `bun run verify`
- `fetch-depth: 0` is required so Turbo can compute the affected graph correctly
- `TURBO_SCM_BASE` and `TURBO_SCM_HEAD` are set on pull requests for explicit git comparison
- remote cache is optional and picked up through `TURBO_TEAM` and `TURBO_TOKEN`

CI does not deploy anything. There is no direct deploy step to Vercel in the repository workflow.

## Filters

The repo now uses filters in real workflows instead of mentioning them abstractly.

Examples:

```bash
# root app and its internal dependencies
bunx turbo run build --filter=//

# only the shared package
bunx turbo run lint --filter=@archive/core

# changed packages and their dependents
bunx turbo run lint typecheck build --affected
```

## `turbo prune` Strategy

`turbo prune` is intentionally not part of the default workflow here.

Reason:

- the application is root-first and lives at `//`
- current Turborepo pruning is package-scope oriented
- pruning the root app in this repository does not produce a meaningful production subset strategy today

For this repo, `--affected` plus targeted filters gives practical value now. `turbo prune` would be decorative rather than operational.

## Local Environment

Copy the structure from [`.env.example`](/Users/ibragimibragimov/Eldenlord/Blog/.env.example) into a private `.env`.

Safe template values already documented:

- `NEXT_PUBLIC_SITE_URL`
- `CONVEX_DEPLOYMENT`
- `NEXT_PUBLIC_CONVEX_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `GEMINI_MODEL`
- `NODE_OPTIONS`

Private secrets must stay only in `.env`:

- `GEMINI_API_KEY`

[`.gitignore`](/Users/ibragimibragimov/Eldenlord/Blog/.gitignore) already ignores `.env*` and explicitly keeps only `.env.example` tracked.

## Verification Standard

Before shipping changes, run:

```bash
bun run lint
bun run typecheck
bun run verify
```

That is the production path for this repository.
