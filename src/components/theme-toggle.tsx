'use client';

import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <fieldset className="nd-segmented-control">
      <legend className="sr-only">Theme selection</legend>
      <button
        type="button"
        onClick={() => setTheme('light')}
        aria-pressed={theme === 'light'}
        data-state={theme === 'light' ? 'active' : 'inactive'}
        className={cn('shrink-0')}
        title="Light Mode"
      >
        Light
      </button>
      <button
        type="button"
        onClick={() => setTheme('dark')}
        aria-pressed={theme === 'dark'}
        data-state={theme === 'dark' ? 'active' : 'inactive'}
        className={cn('shrink-0')}
        title="Dark Mode"
      >
        Dark
      </button>
      <button
        type="button"
        onClick={() => setTheme('system')}
        aria-pressed={theme === 'system'}
        data-state={theme === 'system' ? 'active' : 'inactive'}
        className={cn('shrink-0')}
        title="System Theme"
      >
        Auto
      </button>
    </fieldset>
  );
}
