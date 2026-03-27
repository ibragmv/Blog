'use client';

import { cn } from '@/lib/utils';

type Language = 'ru' | 'en';

type LanguageToggleProps = {
  value: Language;
  onChange: (language: Language) => void;
};

export function LanguageToggle({ value, onChange }: LanguageToggleProps) {
  return (
    <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1 border border-zinc-200 dark:border-zinc-800 shrink-0 self-start">
      <button
        type="button"
        onClick={() => onChange('ru')}
        className={cn(
          'px-3 py-1 text-sm font-medium rounded-md transition-all',
          value === 'ru'
            ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
            : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
        )}
      >
        RU
      </button>
      <button
        type="button"
        onClick={() => onChange('en')}
        className={cn(
          'px-3 py-1 text-sm font-medium rounded-md transition-all',
          value === 'en'
            ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
            : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
        )}
      >
        EN
      </button>
    </div>
  );
}
