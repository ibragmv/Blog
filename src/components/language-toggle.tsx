'use client';

import { cn } from '@/lib/utils';

type Language = 'ru' | 'en';

type LanguageToggleProps = {
  value: Language;
  onChange: (language: Language) => void;
};

export function LanguageToggle({ value, onChange }: LanguageToggleProps) {
  return (
    <div className="inline-flex shrink-0 items-center rounded-full border border-[var(--border-visible)] p-1">
      <button
        type="button"
        onClick={() => onChange('ru')}
        className={cn(
          'nd-label rounded-full px-4 py-2',
          value === 'ru'
            ? 'bg-[var(--text-display)] text-[var(--black)]'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
        )}
      >
        RU
      </button>
      <button
        type="button"
        onClick={() => onChange('en')}
        className={cn(
          'nd-label rounded-full px-4 py-2',
          value === 'en'
            ? 'bg-[var(--text-display)] text-[var(--black)]'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
        )}
      >
        EN
      </button>
    </div>
  );
}
