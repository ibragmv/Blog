'use client';

import { Search } from 'lucide-react';
import Link from 'next/link';
import { useDeferredValue, useState } from 'react';
import { getPreferredPostContent, getPreferredPostTitle, type PostRecord } from '@/lib/content';
import { formatLongUtcDate } from '@/lib/dates';
import { buildDescription } from '@/lib/seo';

export function BlogIndex({ posts }: { posts: PostRecord[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const normalizedQuery = deferredSearchQuery.trim().toLowerCase();
  const latestYear = posts[0] ? new Date(posts[0].createdAt).getUTCFullYear() : null;

  const filteredPosts = normalizedQuery
    ? posts.filter((post) => getPreferredPostTitle(post).toLowerCase().includes(normalizedQuery))
    : posts;

  return (
    <div className="grid gap-14 animate-in fade-in duration-500">
      <section className="grid gap-10 border-b border-[var(--border)] pb-12 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] lg:items-end">
        <div className="grid gap-5">
          <span className="nd-label text-[var(--text-secondary)]">Writing Index</span>
          <div className="grid gap-5">
            <h1 className="text-balance font-display text-[clamp(4rem,12vw,7.5rem)] leading-[0.84] tracking-[-0.06em] text-[var(--text-display)]">
              ARCHIVE
            </h1>
            <p className="max-w-2xl text-base leading-7 text-[var(--text-secondary)] md:text-lg">
              Essays, notes, and article drafts arranged as a readable index instead of a decorative
              feed.
            </p>
          </div>
        </div>

        <div className="grid gap-5">
          <div className="grid gap-3 border-t border-[var(--border)] pt-5">
            <div className="flex items-end justify-between gap-4">
              <span className="nd-label text-[var(--text-secondary)]">Published</span>
              <span className="font-display text-[clamp(2.75rem,8vw,4.5rem)] leading-[0.9] tracking-[-0.05em] text-[var(--text-display)]">
                {posts.length}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-[var(--border)] pt-3">
              <span className="nd-label text-[var(--text-disabled)]">Latest Year</span>
              <span className="font-mono text-sm uppercase tracking-[0.1em] text-[var(--text-primary)]">
                {latestYear ?? 'N/A'}
              </span>
            </div>
          </div>

          <label className="grid gap-2">
            <span className="nd-label text-[var(--text-secondary)]">Search Signal</span>
            <div className="flex items-center gap-3 border-b border-[var(--border-visible)] pb-3">
              <Search className="text-[var(--text-secondary)]" size={16} aria-hidden="true" />
              <input
                type="search"
                name="search"
                autoComplete="off"
                placeholder="Find post title…"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full min-w-0 bg-transparent text-sm text-[var(--text-display)] placeholder:text-[var(--text-disabled)]"
              />
            </div>
          </label>
        </div>
      </section>

      <section className="grid gap-6">
        <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] pb-3">
          <span className="nd-label text-[var(--text-secondary)]">Archive Feed</span>
          <span className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--text-disabled)]">
            [{filteredPosts.length.toString().padStart(2, '0')} Rows]
          </span>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="flex min-h-56 items-center justify-center border-y border-[var(--border)] px-6 py-12 text-center">
            <p className="max-w-sm text-sm uppercase tracking-[0.12em] text-[var(--text-secondary)]">
              [ No posts match this signal ]
            </p>
          </div>
        ) : (
          <div className="grid">
            {filteredPosts.map((post, index) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                <article className="grid gap-4 border-b border-[var(--border)] py-6 md:grid-cols-[9rem_minmax(0,1fr)_6.5rem] md:items-start md:gap-8">
                  <div className="grid gap-1">
                    <span className="nd-label text-[var(--text-secondary)]">Date</span>
                    <time className="font-mono text-sm uppercase tracking-[0.08em] text-[var(--text-primary)]">
                      {formatLongUtcDate(post.createdAt)}
                    </time>
                  </div>

                  <div className="grid min-w-0 gap-3">
                    <h2 className="max-w-3xl text-balance text-2xl leading-tight tracking-[-0.04em] text-[var(--text-display)] transition-colors group-hover:text-[var(--interactive)] md:text-[2.2rem]">
                      {getPreferredPostTitle(post)}
                    </h2>
                    <p className="max-w-3xl text-sm leading-7 text-[var(--text-secondary)] md:text-base">
                      {buildDescription(getPreferredPostContent(post), '')}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3 md:justify-end">
                    <span className="nd-label text-[var(--text-disabled)]">
                      {index.toString().padStart(2, '0')}
                    </span>
                    <span className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--accent)]">
                      [ Open ]
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
