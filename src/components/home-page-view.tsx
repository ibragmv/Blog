'use client';

import { useState } from 'react';
import { LanguageToggle } from '@/components/language-toggle';
import { LazyMarkdownRenderer } from '@/components/lazy-markdown';

type HomePageViewProps = {
  content: string;
  contentEn?: string;
};

export function HomePageView({ content, contentEn }: HomePageViewProps) {
  const [language, setLanguage] = useState<'ru' | 'en'>('ru');
  const hasTranslation = !!contentEn;
  const currentContent = language === 'en' && contentEn ? contentEn : content;

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      {hasTranslation && (
        <div className="flex justify-end">
          <LanguageToggle value={language} onChange={setLanguage} />
        </div>
      )}
      <div>
        <LazyMarkdownRenderer content={currentContent} preload />
      </div>
    </div>
  );
}
