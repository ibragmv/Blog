'use client';

import { Menu, Shield, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { name: 'Home', path: '/' },
  { name: 'Blog', path: '/blog' },
  { name: 'Links', path: '/links' },
];

export function SiteNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      setIsMenuOpen(false);
    }
  }, [pathname]);

  return (
    <div className="flex items-center gap-4">
      <nav className="hidden md:flex gap-8">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={cn(
              'text-sm font-medium transition-colors hover:text-zinc-900 dark:hover:text-zinc-100',
              pathname === item.path
                ? 'text-zinc-900 dark:text-zinc-100'
                : 'text-zinc-500 dark:text-zinc-500'
            )}
          >
            {item.name}
          </Link>
        ))}
      </nav>

      <Link
        href="/admin"
        className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors p-2"
        title="Admin Panel"
      >
        <Shield size={20} />
      </Link>

      <button
        type="button"
        className="md:hidden p-2 -mr-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        onClick={() => setIsMenuOpen((open) => !open)}
        aria-expanded={isMenuOpen}
        aria-controls="mobile-navigation"
        aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
      >
        {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {isMenuOpen ? (
        <nav
          id="mobile-navigation"
          className="absolute left-0 right-0 top-16 border-t border-zinc-200 bg-white p-4 dark:border-zinc-900 dark:bg-zinc-950 md:hidden"
        >
          <div className="mx-auto flex max-w-3xl flex-col gap-4 px-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  'block py-2 text-sm font-medium transition-colors hover:text-zinc-900 dark:hover:text-zinc-100',
                  pathname === item.path
                    ? 'text-zinc-900 dark:text-zinc-100'
                    : 'text-zinc-500 dark:text-zinc-500'
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
