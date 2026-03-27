# Personal Blog & Admin Panel

A modern, full-stack personal blog platform featuring a built-in admin dashboard. This project is powered by Supabase for data management and provides native support for Markdown-based content creation.

## Features

- 📝 **Markdown Rendering:** Write your posts using Markdown syntax. The engine automatically transforms your text into beautifully styled HTML content.
- 🔐 **Admin Dashboard:** A secure, private interface to create, edit, and delete blog posts.
- ⚡ **Supabase Backend:** Utilizes Supabase (PostgreSQL) for reliable data storage and secure authentication.
- 🎨 **Instant Styling:** Pre-configured styles for all Markdown elements (headers, code blocks, lists, etc.).

## Getting Started

### Prerequisites

- **Bun** (v1.0.0 or higher recommended)
- A **Supabase** project and account

### Local Setup

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Configure Environment Variables:**
   Rename a `.env.example` -> `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

3. **Run the development server:**
   ```bash
   bun run dev
   ```

4. **Other common tasks:**
   ```bash
   bun run lint
   bun run build
   bun run analyze
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Content Management

The blog uses Markdown for post creation. You can use standard formatting such as:
- Headers (`#`, `##`)
- Lists (`-`, `1.`)
- Code blocks (with syntax highlighting)
- Images and Links

All content is rendered dynamically, allowing you to focus on writing while the site handles the styling automatically.
