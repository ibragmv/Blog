# Convex Setup Guide

This project now uses Convex instead of Supabase.

## 1. Start a Local Convex Deployment

Run:

```bash
bun run convex:dev
```

Put the generated or existing Convex deployment values directly into `.env`:

```env
CONVEX_DEPLOYMENT=dev:your_cloud_dev_deployment
NEXT_PUBLIC_CONVEX_URL=https://your_production_deployment.convex.cloud
```

Use the dev deployment for `convex:dev`, and keep `NEXT_PUBLIC_CONVEX_URL` pointed at the deployment the app should talk to.

## 2. Configure Server Environment

Add these values to `.env`:

```env
GEMINI_API_KEY=your_gemini_api_key
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-me
```

## 3. Data Schema

The schema lives in [convex/schema.ts](/Users/ibragimibragimov/Eldenlord/Blog/convex/schema.ts).

Tables:

- `posts`
- `links`
- `sessions`

## 4. Seed or Migrate Content

Convex does not automatically import your old Supabase data. If you already have production content, export it from Supabase and reinsert it into Convex using a temporary script or `convex import`.

Minimum content to recreate manually:

- one `posts` document with `slug: "home"` for the home page
- your published blog posts
- your public links

## 5. Verify

Run:

```bash
bun run typecheck
bun run build
bun run convex:deploy
```

Then open `http://localhost:3000`, check `/blog`, `/links`, and sign in at `/login`.
