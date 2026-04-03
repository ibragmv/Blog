import { api } from '@convex/_generated/api';
import { fetchQuery } from 'convex/nextjs';
import { ImageResponse } from 'next/og';
import { getOgImageOptions, OG_IMAGE_SIZE, renderOgPreview } from '@/lib/og-preview';
import { SITE_CONFIG } from '@/lib/site';

export const alt = SITE_CONFIG.siteName;
export const size = OG_IMAGE_SIZE;
export const contentType = 'image/png';
export const runtime = 'nodejs';

export default async function Image() {
  const homePost = await fetchQuery(api.posts.getHomePage, {});
  const title = homePost?.titleRU?.trim() || SITE_CONFIG.siteName;

  return new ImageResponse(renderOgPreview({ title }), await getOgImageOptions());
}
