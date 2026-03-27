import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '@/components/theme-provider';
import { SITE_CONFIG } from '@/config';
import { buildDocumentTitle } from '@/lib/document';
import { resolveTheme } from '@/lib/theme';

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Home',
  '/blog': 'Blog',
  '/links': 'Links',
  '/login': 'Login',
  '/admin': 'Admin',
  '/admin/new': 'New Post',
};

const faviconCache = new Map<'dark' | 'light', string>();

async function getFaviconHref(theme: 'dark' | 'light', signal: AbortSignal) {
  const cached = faviconCache.get(theme);
  if (cached) {
    return cached;
  }

  const response = await fetch(SITE_CONFIG.logo, { signal });
  const originalSvg = await response.text();
  const color = theme === 'dark' ? '#f4f4f5' : '#18181b';
  const svg = originalSvg.includes('currentColor')
    ? originalSvg.replace(/currentColor/g, color)
    : originalSvg.replace('<svg', `<svg style="fill: ${color}; stroke: ${color};"`);
  const href = `data:image/svg+xml,${encodeURIComponent(svg)}`;

  faviconCache.set(theme, href);
  return href;
}

export function TitleManager() {
  const location = useLocation();
  const { theme } = useTheme();

  useEffect(() => {
    const controller = new AbortController();
    const linkId = 'dynamic-favicon';
    let link = document.getElementById(linkId) as HTMLLinkElement | null;

    if (!link) {
      link = document.createElement('link');
      link.id = linkId;
      link.rel = 'icon';
      document.head.appendChild(link);
    }

    if (!SITE_CONFIG.logo) {
      return () => controller.abort();
    }

    void (async () => {
      try {
        link.href = await getFaviconHref(resolveTheme(theme), controller.signal);
        link.type = 'image/svg+xml';
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Failed to load or process logo SVG:', error);
          link.href = SITE_CONFIG.logo;
        }
      }
    })();

    return () => controller.abort();
  }, [theme]);

  useEffect(() => {
    if (location.pathname.startsWith('/blog/')) {
      return;
    }

    const pageTitle =
      ROUTE_TITLES[location.pathname] ||
      (location.pathname.startsWith('/admin/edit/') ? 'Edit Post' : undefined);

    document.title = buildDocumentTitle(pageTitle);
  }, [location.pathname]);

  return null;
}
