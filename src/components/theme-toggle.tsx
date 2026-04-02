'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <fieldset className="nd-segmented-control">
      <legend className="sr-only">Theme selection</legend>
      <button
        type="button"
        onClick={() => setTheme('light')}
        aria-pressed={mounted ? theme === 'light' : false}
        data-state={mounted && theme === 'light' ? 'active' : 'inactive'}
        className={cn('shrink-0')}
        title="Light Mode"
      >
        Light
      </button>
      <button
        type="button"
        onClick={() => setTheme('dark')}
        aria-pressed={mounted ? theme === 'dark' : false}
        data-state={mounted && theme === 'dark' ? 'active' : 'inactive'}
        className={cn('shrink-0')}
        title="Dark Mode"
      >
        Dark
      </button>
      <button
        type="button"
        onClick={() => setTheme('system')}
        aria-pressed={mounted ? theme === 'system' : false}
        data-state={mounted && theme === 'system' ? 'active' : 'inactive'}
        className={cn('shrink-0')}
        title="System Theme"
      >
        Auto
      </button>
    </fieldset>
  );
}
