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
    <div className="grid gap-14 animate-in fade-in duration-500">
      <section className="grid gap-10 border-b border-[var(--border)] pb-12 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] lg:items-end">
        <div className="grid gap-6">
          <span className="nd-label text-[var(--text-secondary)]">
            Independent Archive / Since 2026
          </span>
          <div className="grid gap-5">
            <h1 className="max-w-5xl text-balance font-display text-[clamp(4.4rem,13vw,8.75rem)] leading-[0.82] tracking-[-0.06em] text-[var(--text-display)]">
              WRITING
              <br className="hidden sm:block" />
              SIGNAL
            </h1>
            <p className="max-w-2xl text-base leading-7 text-[var(--text-secondary)] md:text-lg">
              Essays, notes, translated thoughts, and long-form writing by {SITE_CONFIG.author}. The
              interface now keeps one loud thing on screen at a time and gets out of the way of the
              text.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:justify-self-end lg:text-right">
          <div className="grid gap-2">
            <span className="nd-label text-[var(--text-secondary)]">Current Feed</span>
            <span className="font-mono text-sm uppercase tracking-[0.1em] text-[var(--text-display)]">
              [{language === 'en' ? 'English' : 'Russian'}]
            </span>
          </div>

          {hasTranslation ? (
            <div className="flex justify-start lg:justify-end">
              <LanguageToggle value={language} onChange={setLanguage} />
            </div>
          ) : null}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-12">
        <aside className="grid h-fit gap-6 lg:sticky lg:top-[calc(var(--header-height)+2rem)]">
          <div className="grid gap-2">
            <span className="nd-label text-[var(--text-secondary)]">Reading Mode</span>
            <span className="font-mono text-sm uppercase tracking-[0.1em] text-[var(--text-display)]">
              [ Focus ]
            </span>
          </div>
          <div className="grid gap-2 border-t border-[var(--border)] pt-4">
            <span className="nd-label text-[var(--text-secondary)]">Format</span>
            <p className="text-sm leading-6 text-[var(--text-secondary)]">
              Essays, notes, and bilingual long-form entries with a narrow reading measure.
            </p>
          </div>
        </aside>

        <div className="min-w-0">
          <LazyMarkdownRenderer content={currentContent} preload />
        </div>
      </section>
    </div>
  );
}
