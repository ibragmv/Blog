import Image from 'next/image';
import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/site';
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
        <div className="mx-auto flex min-h-[var(--header-height)] w-full max-w-7xl items-center justify-between gap-5 px-5 py-4 md:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-4">
            <Image
              src="/favicon.svg"
              alt={`${SITE_CONFIG.siteName} logo`}
              width={40}
              height={40}
              sizes="40px"
              priority
              className="h-10 w-10 shrink-0 rounded-full border border-[var(--border)] bg-[var(--surface)] p-1.5"
            />
            <div className="flex min-w-0 flex-col justify-center">
              <span className="nd-label text-[var(--text-secondary)]">Personal Signal</span>
              {IS_MULTI_WORD_TITLE ? (
                <>
                  <span className="truncate text-[1.15rem] font-medium leading-none tracking-[-0.04em] text-[var(--text-display)] md:text-[1.45rem]">
                    {TITLE_WORDS[0]}
                  </span>
                  <span className="truncate font-mono text-[0.68rem] uppercase tracking-[0.14em] text-[var(--text-secondary)] md:pt-1 md:text-[0.76rem]">
                    {TITLE_WORDS.slice(1).join(' ')}
                  </span>
                </>
              ) : (
                <span className="truncate text-[1.35rem] font-medium tracking-[-0.04em] text-[var(--text-display)]">
                  {SITE_CONFIG.title}
                </span>
              )}
            </div>
          </Link>

          <SiteNavigation />
        </div>
      </header>

      <main
        id="main-content"
        className="mx-auto min-h-[calc(100vh-var(--header-height))] w-full max-w-7xl px-5 py-10 md:px-8 md:py-14"
      >
        {children}
      </main>

      <footer className="border-t border-[var(--border)] py-10">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 md:grid-cols-[1.2fr_auto] md:items-end md:px-8">
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
