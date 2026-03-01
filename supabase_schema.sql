-- Enable RLS
alter table if exists public.posts enable row level security;
alter table if exists public.links enable row level security;

-- Create Posts Table
create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  slug text not null unique,
  content text not null,
  published boolean default false,
  is_page boolean default false
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

-- Policies for Posts
create policy "Public posts are viewable by everyone"
  on public.posts for select
  using ( true );

create policy "Users can insert their own posts"
  on public.posts for insert
  with check ( auth.role() = 'authenticated' );

create policy "Users can update their own posts"
  on public.posts for update
  using ( auth.role() = 'authenticated' );

create policy "Users can delete their own posts"
  on public.posts for delete
  using ( auth.role() = 'authenticated' );

-- Policies for Links
create policy "Public links are viewable by everyone"
  on public.links for select
  using ( true );

create policy "Users can manage links"
  on public.links for all
  using ( auth.role() = 'authenticated' );
