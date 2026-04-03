'use client';

import { Shield } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function AdminAccess({ className }: { className?: string }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/login');

  return (
    <Link
      href="/admin"
      aria-label="Admin panel"
      aria-current={isAdminRoute ? 'page' : undefined}
      title="Admin Panel"
      className={cn('group inline-flex items-center justify-center transition-colors', className)}
    >
      <span
        data-admin-access-mobile="true"
        className={cn(
          'flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] transition-colors group-hover:border-[var(--border-visible)] group-hover:text-[var(--text-display)] lg:hidden',
          isAdminRoute &&
            'border-[color-mix(in_srgb,var(--accent)_55%,var(--border))] bg-[var(--accent-subtle)] text-[var(--accent)]'
        )}
      >
        <Shield size={19} aria-hidden="true" strokeWidth={1.9} />
      </span>

      <span
        data-admin-access-desktop="true"
        className="hidden min-w-[5.5rem] flex-col items-center gap-3 pb-3 lg:inline-flex"
      >
        <span
          className={cn(
            'inline-flex items-center gap-2 text-[0.9rem] font-medium uppercase tracking-[0.14em] transition-colors',
            isAdminRoute
              ? 'text-[var(--accent)]'
              : 'text-[var(--text-disabled)] group-hover:text-[var(--text-primary)]'
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              'block h-1.5 w-1.5 rounded-full bg-current opacity-55 transition-opacity',
              isAdminRoute ? 'opacity-100' : 'group-hover:opacity-80'
            )}
          />
          <span>Admin</span>
        </span>
        <span
          aria-hidden="true"
          className={cn(
            'block h-px w-full rounded-full transition-colors',
            isAdminRoute
              ? 'bg-[var(--accent)]'
              : 'bg-transparent group-hover:bg-[color-mix(in_srgb,var(--text-primary)_55%,transparent)]'
          )}
        />
      </span>
    </Link>
  );
}
