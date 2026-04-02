'use client';

import { type JSX, type LazyExoticComponent, lazy, Suspense, useEffect } from 'react';
import { getMarkdownFeatures } from '@/lib/markdown-features';
import type { MarkdownRendererProps } from './markdown-renderer';
import { PageLoader } from './page-loader';

type MarkdownRendererModule = {
  default: (props: MarkdownRendererProps) => JSX.Element;
};

type MarkdownRendererLoader = () => Promise<MarkdownRendererModule>;

const rendererLoaders = {
  base: () =>
    import('./markdown-renderer').then((module) => ({
      default: module.MarkdownRenderer,
    })),
  code: () =>
    import('./markdown-renderer-code').then((module) => ({
      default: module.MarkdownRendererCode,
    })),
  math: () =>
    import('./markdown-renderer-math').then((module) => ({
      default: module.MarkdownRendererMath,
    })),
  raw: () =>
    import('./markdown-renderer-raw').then((module) => ({
      default: module.MarkdownRendererRaw,
    })),
  rich: () =>
    import('./markdown-renderer-rich').then((module) => ({
      default: module.MarkdownRendererRich,
    })),
} satisfies Record<string, MarkdownRendererLoader>;

const lazyRendererCache = new Map<
  keyof typeof rendererLoaders,
  LazyExoticComponent<(props: MarkdownRendererProps) => JSX.Element>
>();

function getRendererKey(content: string) {
  const { hasCode, hasMath, hasRawHtml } = getMarkdownFeatures(content);

  if ((hasCode && hasMath) || (hasCode && hasRawHtml) || (hasMath && hasRawHtml)) {
    return 'rich' as const;
  }

  if (hasCode) {
    return 'code' as const;
  }

  if (hasMath) {
    return 'math' as const;
  }

  if (hasRawHtml) {
    return 'raw' as const;
  }

  return 'base' as const;
}

function getLazyRenderer(content: string) {
  const key = getRendererKey(content);
  const cachedRenderer = lazyRendererCache.get(key);

  if (cachedRenderer) {
    return cachedRenderer;
  }

  const LazyRenderer = lazy(rendererLoaders[key]);
  lazyRendererCache.set(key, LazyRenderer);
  return LazyRenderer;
}

export function preloadMarkdownRenderer(content = '') {
  const key = getRendererKey(content);
  void rendererLoaders[key]();
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
  const MarkdownRenderer = getLazyRenderer(content);

  useEffect(() => {
    if (preload) {
      preloadMarkdownRenderer(content);
    }
  }, [content, preload]);

  return (
    <Suspense fallback={<PageLoader className={fallbackClassName} />}>
      <MarkdownRenderer content={content} {...props} />
    </Suspense>
  );
}
