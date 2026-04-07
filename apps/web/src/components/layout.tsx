import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/site';
import { BrandMark } from './brand-mark';
import { SiteNavigation } from './site-navigation';
import { ThemeToggle } from './theme-toggle';

const TITLE_WORDS = SITE_CONFIG.title.split(' ');
const IS_MULTI_WORD_TITLE = TITLE_WORDS.length > 1;

export function Layout({
  children,
  currentYear,
}: {
  children: React.ReactNode;
  currentYear: number;
}) {
  return (
    <div className="min-h-screen bg-[var(--black)] text-[var(--text-primary)]">
      <a href="#main-content" className="skip-link nd-label">
        Skip to content
      </a>

      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--black)]">
        <div className="mx-auto flex min-h-[var(--header-height)] w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:gap-5 sm:px-5 sm:py-4 md:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-display)] sm:h-11 sm:w-11">
              <BrandMark className="h-7 w-7 sm:h-8 sm:w-8" />
            </span>
            <div className="flex min-w-0 flex-col justify-center gap-1.5">
              <span className="truncate text-[1.02rem] font-medium leading-none tracking-[-0.04em] text-[var(--text-display)] sm:text-[1.16rem] md:text-[1.35rem]">
                {SITE_CONFIG.title}
              </span>
              <span className="nd-label truncate text-[var(--text-secondary)] max-[359px]:hidden">
                {IS_MULTI_WORD_TITLE ? 'Writing Archive' : TITLE_WORDS[0]}
              </span>
            </div>
          </Link>

          <SiteNavigation />
        </div>
      </header>

      <main
        id="main-content"
        className="mx-auto min-h-[calc(100vh-var(--header-height))] w-full max-w-7xl px-4 py-8 sm:px-5 sm:py-10 md:px-8 md:py-14"
      >
        {children}
      </main>

      <footer className="border-t border-[var(--border)] py-10">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-5 md:grid-cols-[1.2fr_auto] md:items-end md:px-8">
          <div className="grid gap-3">
            <span className="nd-label text-[var(--text-secondary)]">Archive Status</span>
            <div className="flex flex-wrap items-end gap-x-5 gap-y-3">
              <span className="font-display text-[clamp(2.6rem,7vw,4.75rem)] leading-[0.9] tracking-[-0.05em] text-[var(--text-display)]">
                {currentYear}
              </span>
              <span className="max-w-xl text-sm leading-6 text-[var(--text-secondary)] md:text-base">
                Independent writing archive, notes, essays, and field signals by{' '}
                {SITE_CONFIG.author}.
              </span>
            </div>
            <div className="nd-label flex flex-wrap gap-x-5 gap-y-2 text-[var(--text-disabled)]">
              <span>[ PUBLIC ]</span>
              <span>[ WRITING ]</span>
              <span>[ ALL RIGHTS RESERVED ]</span>
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 md:items-end">
            <span className="nd-label text-[var(--text-secondary)]">Mode Control</span>
            <ThemeToggle />
          </div>
        </div>
      </footer>
    </div>
  );
}
