'use client';

import { useState } from 'react';
import { LanguageToggle } from '@/components/language-toggle';
import { LazyMarkdownRenderer } from '@/components/lazy-markdown';
import { SITE_CONFIG } from '@/lib/site';

type HomePageViewProps = {
  content: string;
  contentEn?: string;
};

export function HomePageView({ content, contentEn }: HomePageViewProps) {
  const [language, setLanguage] = useState<'ru' | 'en'>(contentEn ? 'en' : 'ru');
  const hasTranslation = !!contentEn;
  const currentContent = language === 'en' && contentEn ? contentEn : content;

  return (
    <div className="grid gap-12 animate-in fade-in duration-500">
      <section className="grid gap-8 border-b border-[var(--border)] pb-12 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)] lg:items-end">
        <div className="grid gap-5">
          <span className="nd-label text-[var(--text-secondary)]">
            Independent Archive / Since 2026
          </span>
          <div className="grid gap-4">
            <h1 className="max-w-4xl font-display text-[clamp(4rem,12vw,8rem)] leading-[0.88] tracking-[-0.06em] text-[var(--text-display)]">
              SIGNAL
              <br />
              BLOG
            </h1>
            <p className="max-w-2xl text-base leading-7 text-[var(--text-secondary)] md:text-lg">
              Essays, notes, translated thoughts, and long-form writing by {SITE_CONFIG.author}. The
              interface is intentionally reduced so the text carries the weight.
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:justify-self-end">
          {hasTranslation ? (
            <div className="flex justify-start lg:justify-end">
              <LanguageToggle value={language} onChange={setLanguage} />
            </div>
          ) : null}

          <div className="nd-panel-raised dot-grid-subtle grid gap-4 p-5 md:p-6">
            <span className="nd-label text-[var(--text-secondary)]">Screen Layers</span>
            <div className="grid gap-3">
              <div className="flex items-baseline justify-between gap-4">
                <span className="nd-label text-[var(--text-disabled)]">Primary</span>
                <span className="font-mono text-sm uppercase tracking-[0.08em] text-[var(--text-display)]">
                  Long-form text
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <span className="nd-label text-[var(--text-disabled)]">Secondary</span>
                <span className="font-mono text-sm uppercase tracking-[0.08em] text-[var(--text-primary)]">
                  Translation switch
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <span className="nd-label text-[var(--text-disabled)]">Tertiary</span>
                <span className="font-mono text-sm uppercase tracking-[0.08em] text-[var(--accent)]">
                  System labels
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="grid h-fit gap-6 lg:sticky lg:top-28">
          <div className="grid gap-2">
            <span className="nd-label text-[var(--text-secondary)]">Current Feed</span>
            <span className="font-mono text-sm uppercase tracking-[0.1em] text-[var(--text-display)]">
              [{language === 'en' ? 'English' : 'Russian'}]
            </span>
          </div>
          <div className="grid gap-2 border-t border-[var(--border)] pt-4">
            <span className="nd-label text-[var(--text-secondary)]">Composition</span>
            <span className="text-sm leading-6 text-[var(--text-secondary)]">
              Three-layer hierarchy, mono metadata, display typography only for hero moments.
            </span>
          </div>
        </aside>

        <div className="min-w-0">
          <LazyMarkdownRenderer content={currentContent} preload />
        </div>
      </section>
    </div>
  );
}
