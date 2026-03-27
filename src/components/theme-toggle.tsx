'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="inline-flex items-center p-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <button
        type="button"
        onClick={() => setTheme('light')}
        className={cn(
          'p-2 rounded-full transition-all duration-200 focus:outline-none',
          theme === 'light'
            ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
            : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
        )}
        title="Light Mode"
      >
        <Sun size={16} />
      </button>
      <button
        type="button"
        onClick={() => setTheme('dark')}
        className={cn(
          'p-2 rounded-full transition-all duration-200 focus:outline-none',
          theme === 'dark'
            ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
            : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
        )}
        title="Dark Mode"
      >
        <Moon size={16} />
      </button>
      <button
        type="button"
        onClick={() => setTheme('system')}
        className={cn(
          'p-2 rounded-full transition-all duration-200 focus:outline-none',
          theme === 'system'
            ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
            : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
        )}
        title="System Theme"
      >
        <Monitor size={16} />
      </button>
    </div>
  );
}
