import { api } from '@convex/_generated/api';
import { fetchQuery } from 'convex/nextjs';
import { ImageResponse } from 'next/og';
import { getPrimaryPostTitle } from '@/lib/content';
import { getOgImageOptions, OG_IMAGE_SIZE, renderOgPreview } from '@/lib/og-preview';
import { SITE_CONFIG } from '@/lib/site';

export const alt = SITE_CONFIG.siteName;
export const size = OG_IMAGE_SIZE;
export const contentType = 'image/png';
export const runtime = 'nodejs';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const post = await fetchQuery(api.posts.getPublishedBySlug, { slug });

  const title = post ? getPrimaryPostTitle(post) : 'Post not found';

  return new ImageResponse(renderOgPreview({ title }), await getOgImageOptions());
}
