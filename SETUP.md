# Supabase Database Setup Guide

This guide will help you initialize your database schema and configure Row Level Security (RLS) policies. Follow these steps to get your blog up and running with translation support.

## 1. Initialize Tables & Enable RLS

Go to your [Supabase Dashboard](https://supabase.com/dashboard), navigate to the **SQL Editor**, and run the following script to create your tables and enable security.

### Option A: Fresh Start (New Database)

Use this if you haven't created the tables yet.

```sql
-- Create Posts Table with Translation Support
create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  title_en text, -- English translation of the title
  slug text not null unique,
  content text not null,
  content_en text, -- English translation of the content
  published boolean default false
);

-- Create Links Table
create table if not exists public.links (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  url text not null,
  icon text default 'default',
  "order" integer default 0
);

-- IMPORTANT: Explicitly Enable Row Level Security
alter table public.posts enable row level security;
alter table public.links enable row level security;
```

### Option B: Update Existing Database

Use this if you already created the tables using the old guide and need to add translation support.

```sql
-- Add translation columns to existing posts table
alter table public.posts 
add column if not exists title_en text,
add column if not exists content_en text;

-- Ensure RLS is enabled for existing tables
alter table public.posts enable row level security;
alter table public.links enable row level security;
```

## 2. Configure Security Policies

Run this script in the **SQL Editor** to define who can read and manage your data. This ensures your admin panel is secure while your posts remain public.

```sql
-- RLS Policies for Posts

-- Allow everyone to read published posts
create policy "Public posts are viewable by everyone"
  on public.posts for select
  using ( published = true );

-- Allow authenticated users (admin) to do everything with posts
create policy "Admins can do everything with posts"
  on public.posts for all
  using ( auth.role() = 'authenticated' );

-- RLS Policies for Links

-- Allow everyone to read links
create policy "Links are viewable by everyone"
  on public.links for select
  using ( true );

-- Allow authenticated users (admin) to manage links
create policy "Admins can manage links"
  on public.links for all
  using ( auth.role() = 'authenticated' );
```

## 3. Create Admin Account

To access the admin panel at `/login`, you need to manually create an administrative user:

1. In the Supabase sidebar, go to **Authentication** -> **Users**.
2. Click the **Add User** button and select **Create new user**.
3. Enter your email and a strong password.
4. (Optional) You may want to disable "Confirm Email" in **Auth Settings** if you want to log in immediately without checking your inbox.

## 4. Final Check

Once the scripts are executed:
- Your `posts` table should have `title_en` and `content_en` columns in the **Table Editor**.
- The "RLS" badge should be green (Enabled) for both tables.
- You can now start adding content via your site's admin panel.
