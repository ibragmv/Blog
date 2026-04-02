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
        className={cn(
          'flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] transition-colors group-hover:border-[var(--border-visible)] group-hover:text-[var(--text-display)] lg:hidden',
          isAdminRoute &&
            'border-[color-mix(in_srgb,var(--accent)_55%,var(--border))] bg-[var(--accent-subtle)] text-[var(--accent)]'
        )}
      >
        <Shield size={19} aria-hidden="true" strokeWidth={1.9} />
      </span>

      <span className="hidden lg:inline-flex min-w-[6rem] flex-col items-center gap-3 pb-3">
        <span
          className={cn(
            'inline-flex items-center gap-2 font-mono text-[0.76rem] font-normal uppercase tracking-[0.12em] transition-colors',
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
            'block h-px w-16 transition-colors',
            isAdminRoute
              ? 'bg-[var(--accent)]'
              : 'bg-transparent group-hover:bg-[color-mix(in_srgb,var(--text-primary)_55%,transparent)]'
          )}
        />
      </span>
    </Link>
  );
}
