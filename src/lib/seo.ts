import { extractContentPreview } from '@/lib/content-preview';
import { getSiteUrl, SITE_CONFIG } from '@/lib/site';

export function buildPageTitle(pageTitle?: string) {
  return pageTitle
    ? `${pageTitle} ${SITE_CONFIG.titleSeparator} ${SITE_CONFIG.title}`
    : SITE_CONFIG.title;
}

export function buildDescription(
  summary?: string | null,
  content?: string | null,
  fallback: string = SITE_CONFIG.description
) {
  const normalizedSummary = summary?.trim();
  if (normalizedSummary) {
    return normalizedSummary;
  }

  if (!content) {
    return fallback;
  }

  const preview = extractContentPreview(content, 160);
  return preview || fallback;
}

export function absoluteUrl(path = '/') {
  return new URL(path, getSiteUrl()).toString();
}
