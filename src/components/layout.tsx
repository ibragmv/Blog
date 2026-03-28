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
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-300 font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800 selection:text-zinc-900 dark:selection:text-zinc-100 transition-colors duration-300">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-900 transition-colors duration-300">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 leading-none font-bold tracking-tight text-zinc-900 dark:text-zinc-100 hover:opacity-70 transition-opacity font-display uppercase"
          >
            <Image
              src={SITE_CONFIG.logo}
              alt={`${SITE_CONFIG.siteName} logo`}
              width={32}
              height={32}
              sizes="32px"
              priority
              className="w-8 h-8"
            />
            <div className="flex flex-col">
              {IS_MULTI_WORD_TITLE ? (
                <>
                  <span className="text-xl">{TITLE_WORDS[0]}</span>
                  <span className="text-xl">{TITLE_WORDS.slice(1).join(' ')}</span>
                </>
              ) : (
                <span className="text-2xl">{SITE_CONFIG.title}</span>
              )}
            </div>
          </Link>

          <SiteNavigation />
        </div>
      </header>

      <main className="pt-24 pb-16 px-6 max-w-3xl mx-auto min-h-[calc(100vh-4rem)]">
        {children}
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-900 py-12">
        <div className="max-w-3xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-xs text-zinc-500 dark:text-zinc-600">
            &copy; {currentYear} Ibragim Ibragimov. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <ThemeToggle />
          </div>
        </div>
      </footer>
    </div>
  );
}
