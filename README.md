# Personal Blog & Admin Panel

Next.js App Router blog with a Convex backend, Markdown authoring, dynamic Open Graph images, RSS, and a private admin dashboard.

## Stack

- Next.js App Router + React 19
- Convex for posts, links, and session storage
- Next route handlers for RSS, admin session management, and Gemini-powered translation endpoints
- Tailwind CSS 4

## Local Setup

1. Install dependencies:

```bash
bun install
```

2. Start Convex locally only if you want a dedicated development deployment and local Convex tooling:

```bash
bun run convex:dev
```

3. Create `.env` from `.env.example` and set:

```env
CONVEX_DEPLOYMENT=dev:your_cloud_dev_deployment
NEXT_PUBLIC_CONVEX_URL=https://your-production-deployment.convex.cloud
GEMINI_API_KEY=your_gemini_api_key
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-me
```

`CONVEX_DEPLOYMENT` is only for the Convex CLI (`convex dev`, `convex deploy`).
`NEXT_PUBLIC_CONVEX_URL` is the actual Convex backend URL used by the running Next.js app.
If your site already works against production, seeing `dev:...` in `CONVEX_DEPLOYMENT` does not mean the app is using a dev database at runtime.

4. Start the app:

```bash
bun run dev
```

## Common Tasks

```bash
bun run typecheck
bun run lint
bun run build
bun run convex:deploy
```

## Content Model

- `posts`: blog posts and the home page (`slug: "home"`)
- `links`: public links for the `/links` page
- `sessions`: server-issued admin sessions used by the dashboard

The schema lives in [convex/schema.ts](/Users/ibragimibragimov/Eldenlord/Blog/convex/schema.ts).

## Data Migration

Convex does not automatically import old Supabase data. If you already have production content, export it from the old source and reinsert it into Convex with a temporary script or `convex import`.

Minimum content to recreate manually:

- one `posts` document with `slug: "home"` for the home page
- your published blog posts
- your public links

## Admin Access

The admin login uses `ADMIN_EMAIL` and `ADMIN_PASSWORD` from the server environment. Session state is persisted in Convex and mirrored via an HttpOnly cookie plus a short-lived session token returned by `/api/admin/session`.

Only `.env.example` and `.env` are needed for this repo. The `convex:dev` script reads `CONVEX_DEPLOYMENT` from `.env`, while the app itself reads `NEXT_PUBLIC_CONVEX_URL`. These are separate concerns and may point to different Convex deployments.

## Verification

Run:

```bash
bun run typecheck
bun run lint
bun run build
bun run convex:deploy
```

Then open `http://localhost:3000`, check `/blog`, `/links`, and sign in at `/login`.
