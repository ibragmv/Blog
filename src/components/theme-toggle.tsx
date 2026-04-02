'use client';

import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className="inline-flex items-center rounded-full border border-[var(--border-visible)] p-1"
      role="tablist"
      aria-label="Theme selection"
    >
      <button
        type="button"
        onClick={() => setTheme('light')}
        className={cn(
          'nd-label rounded-full px-4 py-2',
          theme === 'light'
            ? 'bg-[var(--text-display)] text-[var(--black)]'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
        )}
        title="Light Mode"
      >
        Light
      </button>
      <button
        type="button"
        onClick={() => setTheme('dark')}
        className={cn(
          'nd-label rounded-full px-4 py-2',
          theme === 'dark'
            ? 'bg-[var(--text-display)] text-[var(--black)]'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
        )}
        title="Dark Mode"
      >
        Dark
      </button>
      <button
        type="button"
        onClick={() => setTheme('system')}
        className={cn(
          'nd-label rounded-full px-4 py-2',
          theme === 'system'
            ? 'bg-[var(--text-display)] text-[var(--black)]'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
        )}
        title="System Theme"
      >
        Auto
      </button>
    </div>
  );
}
