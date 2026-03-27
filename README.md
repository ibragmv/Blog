# Personal Blog & Admin Panel

React + Vite blog with a Convex backend, Markdown authoring, server-rendered meta tags, and a private admin dashboard.

## Stack

- React 19 + Vite
- Convex for posts, links, and admin session storage
- Express for local dev/server rendering, RSS, OG/meta injection, and Gemini-powered translation endpoints
- Tailwind CSS 4

## Local Setup

1. Install dependencies:

```bash
bun install
```

2. Start Convex locally and keep it running in a separate terminal:

```bash
bun run convex:dev
```

3. Create `.env` from `.env.example` and set:

```env
CONVEX_DEPLOYMENT=dev:your_cloud_dev_deployment
VITE_CONVEX_URL=https://your_production_deployment.convex.cloud
GEMINI_API_KEY=your_gemini_api_key
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-me
```

4. Start the app:

```bash
bun run dev
```

## Common Tasks

```bash
bun run typecheck
bun run lint
bun run build
bun run analyze
bun run convex:deploy
```

## Content Model

- `posts`: blog posts and the home page (`slug: "home"`)
- `links`: public links for the `/links` page
- `adminSessions`: server-issued admin sessions used by the dashboard

## Admin Access

The admin login uses `ADMIN_EMAIL` and `ADMIN_PASSWORD` from the server environment. Session state is persisted in Convex and mirrored via an HttpOnly cookie plus a short-lived session token returned by `/api/admin/session`.

Only `.env.example` and `.env` are needed for this repo. The `convex:dev` script reads `CONVEX_DEPLOYMENT` from `.env`, and `convex:deploy` publishes backend changes to the production deployment tied to the same Convex project.
