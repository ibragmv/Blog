'use client';

import { cn } from '@/lib/utils';

type Language = 'ru' | 'en';

type LanguageToggleProps = {
  value: Language;
  onChange: (language: Language) => void;
};

export function LanguageToggle({ value, onChange }: LanguageToggleProps) {
  return (
    <fieldset className="nd-segmented-control shrink-0">
      <legend className="sr-only">Language selection</legend>
      <button
        type="button"
        onClick={() => onChange('ru')}
        aria-pressed={value === 'ru'}
        data-state={value === 'ru' ? 'active' : 'inactive'}
        className={cn('shrink-0')}
      >
        RU
      </button>
      <button
        type="button"
        onClick={() => onChange('en')}
        aria-pressed={value === 'en'}
        data-state={value === 'en' ? 'active' : 'inactive'}
        className={cn('shrink-0')}
      >
        EN
      </button>
    </fieldset>
  );
}
