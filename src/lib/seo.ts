import { extractContentPreview } from '@/lib/content-preview';
import { getSiteUrl, SITE_CONFIG } from '@/lib/site';

export function buildPageTitle(pageTitle?: string) {
  return pageTitle
    ? `${pageTitle} ${SITE_CONFIG.titleSeparator} ${SITE_CONFIG.title}`
    : SITE_CONFIG.title;
}

export function buildDescription(content?: string | null) {
  if (!content) {
    return SITE_CONFIG.description;
  }

  const preview = extractContentPreview(content, 160);
  return preview || SITE_CONFIG.description;
}

export function absoluteUrl(path = '/') {
  return new URL(path, getSiteUrl()).toString();
}
