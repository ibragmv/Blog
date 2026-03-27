import { SITE_CONFIG } from '@/lib/site';

export const RSS_REVALIDATE_SECONDS = 300;
export const RSS_ICON_PATH = '/icon.png';

export function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export function buildFeedTitle() {
  return SITE_CONFIG.siteName;
}
