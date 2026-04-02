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
    <div className="flex items-center gap-2 md:gap-4">
      <nav className="hidden items-center gap-5 md:flex">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={cn(
              'nd-label relative pb-1 transition-colors',
              pathname === item.path
                ? 'text-[var(--text-display)]'
                : 'text-[var(--text-disabled)] hover:text-[var(--text-primary)]'
            )}
          >
            {pathname === item.path ? `[ ${item.name.toUpperCase()} ]` : item.name.toUpperCase()}
          </Link>
        ))}
      </nav>

      <Link
        href="/admin"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--border-visible)] hover:text-[var(--text-display)]"
        title="Admin Panel"
        aria-label="Admin panel"
      >
        <Shield size={20} />
      </Link>

      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--border-visible)] hover:text-[var(--text-display)] md:hidden"
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
          className="absolute left-0 right-0 top-20 border-b border-[var(--border)] bg-[var(--black)] px-5 py-5 md:hidden"
        >
          <div className="mx-auto grid max-w-6xl gap-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  'nd-panel flex items-center justify-between px-4 py-3',
                  pathname === item.path
                    ? 'border-[var(--border-visible)] text-[var(--text-display)]'
                    : 'text-[var(--text-secondary)]'
                )}
              >
                <span className="nd-label">{item.name}</span>
                <span className="font-mono text-xs uppercase tracking-[0.12em]">
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
