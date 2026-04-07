'use client';

import { lazy, Suspense, useEffect } from 'react';
import type { MarkdownRendererProps } from './markdown-renderer';
import { PageLoader } from './page-loader';

const LazyMarkdownRendererComponent = lazy(() =>
  import('./markdown-renderer').then((module) => ({
    default: module.MarkdownRenderer,
  }))
);

export function preloadMarkdownRenderer() {
  void import('./markdown-renderer');
}

type LazyMarkdownRendererProps = MarkdownRendererProps & {
  preload?: boolean;
  fallbackClassName?: string;
};

export function LazyMarkdownRenderer({
  content,
  preload = false,
  fallbackClassName,
  ...props
}: LazyMarkdownRendererProps) {
  useEffect(() => {
    if (preload) {
      preloadMarkdownRenderer();
    }
  }, [preload]);

  return (
    <Suspense fallback={<PageLoader className={fallbackClassName} />}>
      <LazyMarkdownRendererComponent content={content} {...props} />
    </Suspense>
  );
}
