'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LanguageToggle } from '@/components/language-toggle';
import { LazyMarkdownRenderer } from '@/components/lazy-markdown';
import type { PostRecord } from '@/lib/content';
import { formatLongUtcDate } from '@/lib/dates';

export function BlogPostView({ post }: { post: PostRecord }) {
  const [language, setLanguage] = useState<'ru' | 'en'>(
    post.titleEn && post.contentEn ? 'en' : 'ru'
  );
  const [readingProgress, setReadingProgress] = useState(0);
  const postId = post.id;

  useEffect(() => {
    let frameId = 0;

    const updateReadingProgress = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress =
        scrollHeight > 0 ? Number(((window.scrollY / scrollHeight) * 100).toFixed(2)) : 0;

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
    if (postId) {
      setLanguage(post.titleEn && post.contentEn ? 'en' : 'ru');
    }
  }, [postId, post.titleEn, post.contentEn]);

  const hasTranslation = !!post.titleEn && !!post.contentEn;
  const currentTitle = language === 'en' && post.titleEn ? post.titleEn : post.title;
  const currentContent = language === 'en' && post.contentEn ? post.contentEn : post.content;
  const progressSegments = Array.from({ length: 20 }, (_, index) => {
    const threshold = ((index + 1) / 20) * 100;
    return readingProgress >= threshold;
  });

  return (
    <article className="grid gap-10 animate-in fade-in duration-500">
      <div className="grid gap-3 border-b border-[var(--border)] pb-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.12em] text-[var(--text-secondary)] hover:text-[var(--text-display)]"
          >
            <ArrowLeft size={16} />
            Back to writing
          </Link>
          <span className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--accent)]">
            [{Math.round(readingProgress)}% Read]
          </span>
        </div>
        <div className="grid grid-cols-10 gap-1 md:grid-cols-20">
          {progressSegments.map((isActive, index) => (
            <span
              key={String(index)}
              className="h-2 w-full"
              style={{
                backgroundColor: isActive ? 'var(--text-display)' : 'var(--border)',
              }}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
        <aside className="grid h-fit gap-6 lg:sticky lg:top-28">
          <div className="grid gap-2">
            <span className="nd-label text-[var(--text-secondary)]">Published</span>
            <time className="font-mono text-sm uppercase tracking-[0.08em] text-[var(--text-display)]">
              {formatLongUtcDate(post.createdAt)}
            </time>
          </div>
          <div className="grid gap-2 border-t border-[var(--border)] pt-4">
            <span className="nd-label text-[var(--text-secondary)]">Language</span>
            {hasTranslation ? (
              <LanguageToggle value={language} onChange={setLanguage} />
            ) : (
              <span className="font-mono text-sm uppercase tracking-[0.08em] text-[var(--text-primary)]">
                [ Single ]
              </span>
            )}
          </div>
          <div className="grid gap-2 border-t border-[var(--border)] pt-4">
            <span className="nd-label text-[var(--text-secondary)]">Status</span>
            <span className="font-mono text-sm uppercase tracking-[0.08em] text-[var(--accent)]">
              [ Reading ]
            </span>
          </div>
        </aside>

        <div className="grid gap-8">
          <header className="grid gap-5 border-b border-[var(--border)] pb-8">
            <span className="nd-label text-[var(--text-secondary)]">Article Transmission</span>
            <h1 className="max-w-4xl font-display text-[clamp(3rem,10vw,6.5rem)] leading-[0.9] tracking-[-0.06em] text-[var(--text-display)]">
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
