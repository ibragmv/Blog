'use client';

import type { api } from '@convex/_generated/api';
import type { Preloaded } from 'convex/react';
import { usePreloadedQuery } from 'convex/react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { LanguageToggle } from '@/components/language-toggle';
import { LazyMarkdownRenderer } from '@/components/lazy-markdown';
import { getDefaultContentLanguage } from '@/lib/content';
import { formatLongUtcDate } from '@/lib/dates';

export function ArchivePostView({
  preloadedPost,
}: {
  preloadedPost: Preloaded<typeof api.posts.getPublishedBySlug>;
}) {
  const post = usePreloadedQuery(preloadedPost);
  const [readingProgress, setReadingProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const postId = post?.id ?? null;
  const defaultLanguage = getDefaultContentLanguage(post);
  const [language, setLanguage] = useState<'ru' | 'en'>('en');

  useEffect(() => {
    let frameId = 0;

    const updateReadingProgress = () => {
      const contentElement = contentRef.current;

      if (!contentElement) {
        setReadingProgress(0);
        return;
      }

      const rect = contentElement.getBoundingClientRect();
      const contentTop = window.scrollY + rect.top;
      const contentBottom = contentTop + contentElement.offsetHeight;
      const viewportOffset = window.innerHeight * 0.3;
      const startScroll = contentTop - viewportOffset;
      const endScroll = Math.max(contentBottom - window.innerHeight, startScroll + 1);
      const rawProgress = ((window.scrollY - startScroll) / (endScroll - startScroll)) * 100;
      const nextProgress = Number(Math.min(100, Math.max(0, rawProgress)).toFixed(2));

      setReadingProgress(nextProgress);
    };

    const scheduleReadingProgress = () => {
      if (frameId !== 0) {
        return;
      }

      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        updateReadingProgress();
      });
    };

    scheduleReadingProgress();
    window.addEventListener('scroll', scheduleReadingProgress, { passive: true });
    window.addEventListener('resize', scheduleReadingProgress);

    return () => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener('scroll', scheduleReadingProgress);
      window.removeEventListener('resize', scheduleReadingProgress);
    };
  }, []);

  useEffect(() => {
    if (!postId || !post) {
      return;
    }

    setLanguage(defaultLanguage);
  }, [defaultLanguage, postId, post]);

  if (!post) {
    return (
      <article className="grid gap-10 animate-in fade-in duration-500">
        <div className="border-y border-[var(--border)] py-10 text-center">
          <p className="text-base uppercase tracking-[0.12em] text-[var(--text-secondary)]">
            [ Article is no longer published ]
          </p>
        </div>
      </article>
    );
  }

  const hasTranslation = !!post.titleEN && !!post.contentEN;
  const activeLanguage = hasTranslation ? language : defaultLanguage;
  const currentTitle = activeLanguage === 'en' && post.titleEN ? post.titleEN : post.titleRU;
  const currentContent =
    activeLanguage === 'en' && post.contentEN ? post.contentEN : post.contentRU;
  const progressSegments = Array.from({ length: 16 }, (_, index) => {
    const threshold = ((index + 1) / 16) * 100;
    return readingProgress >= threshold;
  });

  return (
    <article className="grid gap-10 animate-in fade-in duration-500">
      <div className="sticky top-[var(--header-height)] z-30 grid gap-4 border-y border-[var(--border)] bg-[var(--black)] py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/archive"
            className="inline-flex min-h-11 items-center gap-2 text-base font-medium uppercase tracking-[0.12em] text-[var(--text-secondary)] hover:text-[var(--text-display)]"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to archive
          </Link>
          <span className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--accent)]">
            [{Math.round(readingProgress)}% Read]
          </span>
        </div>
        <div
          className="grid grid-cols-8 gap-1 md:grid-cols-16"
          role="progressbar"
          aria-label="Article reading progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(readingProgress)}
        >
          {progressSegments.map((isActive, index) => (
            <span
              key={String(index)}
              className="h-2.5 w-full"
              style={{
                backgroundColor: isActive ? 'var(--text-display)' : 'var(--border)',
              }}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-8 md:gap-10 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-14">
        <aside className="grid h-fit gap-4 border-t border-[var(--border)] pt-5 sm:grid-cols-3 sm:gap-6 lg:grid-cols-1 lg:gap-6 lg:border-t-0 lg:pt-0 lg:sticky lg:top-[calc(var(--header-height)+6rem)]">
          <div className="grid gap-2">
            <span className="nd-label text-[var(--text-secondary)]">Published</span>
            <time className="text-[0.95rem] font-medium uppercase tracking-[0.12em] text-[var(--text-display)]">
              {formatLongUtcDate(post.createdAt)}
            </time>
          </div>
          <div className="grid gap-2 border-t border-[var(--border)] pt-4">
            <span className="nd-label text-[var(--text-secondary)]">Language</span>
            {hasTranslation ? (
              <LanguageToggle value={language} onChange={setLanguage} />
            ) : (
              <span className="text-[0.95rem] font-medium uppercase tracking-[0.12em] text-[var(--text-primary)]">
                [ Single ]
              </span>
            )}
          </div>
          <div className="hidden gap-2 border-t border-[var(--border)] pt-4 lg:grid">
            <span className="nd-label text-[var(--text-secondary)]">Progress</span>
            <span className="text-[0.95rem] font-medium uppercase tracking-[0.12em] text-[var(--accent)]">
              [{Math.round(readingProgress)}% Read]
            </span>
          </div>
        </aside>

        <div ref={contentRef} className="grid min-w-0 gap-8">
          <header className="grid gap-4 border-b border-[var(--border)] pb-6 md:gap-5 md:pb-8">
            <span className="nd-label text-[var(--text-secondary)]">Article Transmission</span>
            <h1 className="max-w-4xl text-balance text-[clamp(2rem,10vw,6.25rem)] font-medium leading-[0.98] tracking-[-0.04em] text-[var(--text-display)] md:leading-[0.88] md:tracking-[-0.06em]">
              {currentTitle}
            </h1>
          </header>

          <div className="transition-opacity duration-300">
            <LazyMarkdownRenderer content={currentContent} preload />
          </div>
        </div>
      </div>
    </article>
  );
}
