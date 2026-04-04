'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { startTransition } from 'react';
import type { ContentLanguage } from '@/lib/content';
import { LanguageToggle } from './language-toggle';

type ContentLanguageToggleProps = {
  defaultLanguage: ContentLanguage;
  value: ContentLanguage;
};

export function ContentLanguageToggle({ defaultLanguage, value }: ContentLanguageToggleProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (language: ContentLanguage) => {
    const nextSearchParams = new URLSearchParams(searchParams.toString());

    if (language === defaultLanguage) {
      nextSearchParams.delete('lang');
    } else {
      nextSearchParams.set('lang', language);
    }

    const nextQuery = nextSearchParams.toString();
    const nextHref = nextQuery ? `${pathname}?${nextQuery}` : pathname;

    startTransition(() => {
      router.replace(nextHref, { scroll: false });
    });
  };

  return <LanguageToggle value={value} onChange={handleChange} />;
}
