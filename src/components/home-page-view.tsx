import { ContentLanguageToggle } from '@/components/content-language-toggle';
import { MarkdownContent } from '@/components/markdown-content';
import type { PostRecord } from '@/lib/content';
import { SITE_CONFIG } from '@/lib/site';

type HomePageViewProps = {
  activeLanguage: 'ru' | 'en';
  defaultLanguage: 'ru' | 'en';
  fallbackContent: string;
  post: PostRecord | null;
};

export function HomePageView({
  activeLanguage,
  defaultLanguage,
  fallbackContent,
  post,
}: HomePageViewProps) {
  const contentRU = post?.contentRU || fallbackContent;
  const contentEN = post?.contentEN;
  const hasTranslation = !!contentEN;
  const currentContent = activeLanguage === 'en' && contentEN ? contentEN : contentRU;

  return (
    <div className="grid gap-10 animate-in fade-in duration-500 md:gap-14">
      <section className="grid gap-8 border-b border-[var(--border)] pb-10 md:gap-10 md:pb-12 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] lg:items-end">
        <div className="grid gap-5 md:gap-6">
          <span className="nd-label text-[var(--text-secondary)]">
            Independent Archive / Since 2026
          </span>
          <div className="grid gap-4 md:gap-5">
            <h1 className="max-w-[10ch] font-display text-[clamp(2.9rem,15vw,8.75rem)] leading-[0.84] tracking-[-0.04em] text-[var(--text-display)] sm:max-w-5xl sm:tracking-[-0.06em]">
              <span className="block">WRITING</span>
              <span className="block">SIGNAL</span>
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base sm:leading-7 md:text-lg">
              Essays, notes, translated thoughts, and long-form writing by {SITE_CONFIG.author}. The
              interface now keeps one loud thing on screen at a time and gets out of the way of the
              text.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:gap-6 lg:justify-self-end lg:text-right">
          <div className="grid gap-2">
            <span className="nd-label text-[var(--text-secondary)]">Current Feed</span>
            <span className="font-mono text-sm uppercase tracking-[0.1em] text-[var(--text-display)]">
              [{activeLanguage === 'en' ? 'English' : 'Russian'}]
            </span>
          </div>

          {hasTranslation ? (
            <div className="flex justify-start lg:justify-end">
              <ContentLanguageToggle defaultLanguage={defaultLanguage} value={activeLanguage} />
            </div>
          ) : null}
        </div>
      </section>

      <section className="grid gap-8 md:gap-10 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-12">
        <aside className="grid h-fit gap-6 border-t border-[var(--border)] pt-5 sm:grid-cols-2 sm:gap-8 lg:sticky lg:top-[calc(var(--header-height)+2rem)] lg:grid-cols-1 lg:border-t-0 lg:pt-0">
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
          <MarkdownContent content={currentContent} />
        </div>
      </section>
    </div>
  );
}
