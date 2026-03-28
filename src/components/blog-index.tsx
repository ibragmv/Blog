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

  const filteredPosts = normalizedQuery
    ? posts.filter((post) => getPreferredPostTitle(post).toLowerCase().includes(normalizedQuery))
    : posts;

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-display">
          Writing
        </h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <input
            type="search"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="pl-9 pr-4 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 w-full sm:w-64 transition-all"
          />
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <p className="text-zinc-500">No posts found matching your search.</p>
      ) : (
        <div className="grid gap-8">
          {filteredPosts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
              <article className="space-y-2">
                <h2 className="text-xl font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-display">
                  {getPreferredPostTitle(post)}
                </h2>
                <div className="text-sm text-zinc-500">{formatLongUtcDate(post.createdAt)}</div>
                <p className="text-zinc-600 dark:text-zinc-400 line-clamp-2 text-sm leading-relaxed">
                  {buildDescription(getPreferredPostContent(post), '')}
                </p>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
