import { ImageResponse } from 'next/og';
import { OG_IMAGE_SIZE, renderOgPreview } from '@/lib/og-preview';
import { getHomePagePost } from '@/lib/server/data';
import { SITE_CONFIG } from '@/lib/site';

export const alt = SITE_CONFIG.siteName;
export const size = OG_IMAGE_SIZE;
export const contentType = 'image/png';

export default async function Image() {
  const homePost = await getHomePagePost();
  const title = homePost?.title?.trim() || SITE_CONFIG.siteName;

  return new ImageResponse(renderOgPreview({ title }), size);
}
