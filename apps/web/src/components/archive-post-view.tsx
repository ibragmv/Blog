import { ContentLanguageToggle } from '@/components/content-language-toggle';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { ReadingProgress } from '@/components/reading-progress';
import type { ContentLanguage, PostRecord } from '@/lib/content';
import { formatLongUtcDate } from '@/lib/dates';

export function ArchivePostView({
  activeLanguage,
  defaultLanguage,
  post,
}: {
  activeLanguage: ContentLanguage;
  defaultLanguage: ContentLanguage;
  post: PostRecord;
}) {
  const hasTranslation = !!post.titleEN && !!post.contentEN;
  const currentTitle = activeLanguage === 'en' && post.titleEN ? post.titleEN : post.titleRU;
  const currentContent =
    activeLanguage === 'en' && post.contentEN ? post.contentEN : post.contentRU;
  const contentSelector = '#article-content';

  return (
    <article className="grid gap-10 animate-in fade-in duration-500">
      <ReadingProgress selector={contentSelector} variant="header" />

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
              <ContentLanguageToggle defaultLanguage={defaultLanguage} value={activeLanguage} />
            ) : (
              <span className="text-[0.95rem] font-medium uppercase tracking-[0.12em] text-[var(--text-primary)]">
                [ Single ]
              </span>
            )}
          </div>
          <div className="hidden gap-2 border-t border-[var(--border)] pt-4 lg:grid">
            <span className="nd-label text-[var(--text-secondary)]">Progress</span>
            <ReadingProgress selector={contentSelector} variant="aside" />
          </div>
        </aside>

        <div id="article-content" className="grid min-w-0 gap-8">
          <header className="grid gap-4 border-b border-[var(--border)] pb-6 md:gap-5 md:pb-8">
            <span className="nd-label text-[var(--text-secondary)]">Article Transmission</span>
            <h1 className="max-w-4xl text-balance text-[clamp(2rem,10vw,6.25rem)] font-medium leading-[0.98] tracking-[-0.04em] text-[var(--text-display)] md:leading-[0.88] md:tracking-[-0.06em]">
              {currentTitle}
            </h1>
          </header>

          <div className="transition-opacity duration-300">
            <MarkdownRenderer content={currentContent} />
          </div>
        </div>
      </div>
    </article>
  );
}
