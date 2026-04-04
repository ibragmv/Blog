import { ImageResponse } from 'next/og';
import { getOgImageOptions, OG_IMAGE_SIZE, renderOgPreview } from '@/lib/og-preview';
import { getHomePagePost } from '@/lib/server/public-data';
import { SITE_CONFIG } from '@/lib/site';

export const alt = SITE_CONFIG.siteName;
export const size = OG_IMAGE_SIZE;
export const contentType = 'image/png';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function Image() {
  const homePost = await getHomePagePost();
  const title = homePost?.titleRU?.trim() || SITE_CONFIG.siteName;

  return new ImageResponse(renderOgPreview({ title }), await getOgImageOptions());
}
