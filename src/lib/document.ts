import { SITE_CONFIG } from '@/config';

export function buildDocumentTitle(pageTitle?: string) {
  return pageTitle
    ? `${pageTitle} ${SITE_CONFIG.titleSeparator} ${SITE_CONFIG.title}`
    : SITE_CONFIG.title;
}
