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
    <div className="flex items-center gap-2.5 md:gap-5">
      <nav className="hidden items-center gap-6 lg:flex">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={cn(
              'border-b border-transparent pb-2 text-[0.9rem] font-medium uppercase tracking-[0.14em] transition-colors',
              pathname === item.path
                ? 'border-[var(--text-display)] text-[var(--text-display)]'
                : 'text-[var(--text-disabled)] hover:text-[var(--text-primary)]'
            )}
          >
            {item.name.toUpperCase()}
          </Link>
        ))}
      </nav>

      <Link
        href="/admin"
        className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--border-visible)] hover:text-[var(--text-display)]"
        title="Admin Panel"
        aria-label="Admin panel"
      >
        <Shield size={19} aria-hidden="true" />
      </Link>

      <button
        type="button"
        className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--border-visible)] hover:text-[var(--text-display)] lg:hidden"
        onClick={() => setIsMenuOpen((open) => !open)}
        aria-expanded={isMenuOpen}
        aria-controls="mobile-navigation"
        aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
      >
        {isMenuOpen ? <X size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />}
      </button>

      {isMenuOpen ? (
        <nav
          id="mobile-navigation"
          className="absolute inset-x-0 top-[var(--header-height)] border-b border-[var(--border)] bg-[var(--black)] px-5 py-5 lg:hidden"
        >
          <div className="mx-auto grid max-w-6xl gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  'flex items-center justify-between border-b border-[var(--border)] py-4',
                  pathname === item.path
                    ? 'text-[var(--text-display)]'
                    : 'text-[var(--text-secondary)]'
                )}
              >
                <span className="text-[0.95rem] font-medium uppercase tracking-[0.14em]">
                  {item.name.toUpperCase()}
                </span>
                <span className="text-sm font-medium uppercase tracking-[0.14em]">
                  {pathname === item.path ? '[ LIVE ]' : '[ OPEN ]'}
                </span>
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
