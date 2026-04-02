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
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--black)] backdrop-blur-sm">
        <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between gap-4 px-5 md:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3 leading-none">
            <Image
              src="/favicon.svg"
              alt={`${SITE_CONFIG.siteName} logo`}
              width={32}
              height={32}
              sizes="32px"
              priority
              className="h-8 w-8 rounded-full border border-[var(--border)] bg-[var(--surface)] p-1"
            />
            <div className="flex min-w-0 flex-col">
              <span className="nd-label text-[var(--text-secondary)]">Personal Signal</span>
              {IS_MULTI_WORD_TITLE ? (
                <>
                  <span className="truncate font-display text-[1.45rem] tracking-[-0.04em] text-[var(--text-display)] md:text-[1.7rem]">
                    {TITLE_WORDS[0]}
                  </span>
                  <span className="-mt-1 truncate font-mono text-[0.72rem] uppercase tracking-[0.16em] text-[var(--text-secondary)] md:text-[0.78rem]">
                    {TITLE_WORDS.slice(1).join(' ')}
                  </span>
                </>
              ) : (
                <span className="truncate font-display text-[1.7rem] tracking-[-0.04em] text-[var(--text-display)]">
                  {SITE_CONFIG.title}
                </span>
              )}
            </div>
          </Link>

          <SiteNavigation />
        </div>
      </header>

      <main className="mx-auto min-h-[calc(100vh-5rem)] w-full max-w-6xl px-5 py-10 md:px-8 md:py-14">
        {children}
      </main>

      <footer className="border-t border-[var(--border)] py-10">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 md:grid-cols-[1.4fr_auto] md:items-end md:px-8">
          <div className="grid gap-3">
            <span className="nd-label text-[var(--text-secondary)]">Archive Status</span>
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
              <span className="font-display text-[clamp(2.25rem,8vw,4.25rem)] leading-none tracking-[-0.05em] text-[var(--text-display)]">
                {currentYear}
              </span>
              <span className="max-w-lg text-sm text-[var(--text-secondary)] md:text-base">
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
