import type { Metadata } from 'next';
import { HomePageView } from '@/components/home-page-view';
import { absoluteUrl, buildDescription } from '@/lib/seo';
import { getHomePagePost } from '@/lib/server/data';
import { SITE_CONFIG } from '@/lib/site';

const HOME_FALLBACK_CONTENT =
  '# Welcome\n\nThis is the home page. You can edit this content in the admin panel by creating a post with the slug `home`.';

export async function generateMetadata(): Promise<Metadata> {
  const homePost = await getHomePagePost();
  const description = buildDescription(homePost?.summary, homePost?.content);
  const ogImage = absoluteUrl('/opengraph-image');

  return {
    description,
    alternates: {
      canonical: absoluteUrl('/'),
    },
    openGraph: {
      type: 'website',
      locale: SITE_CONFIG.locale,
      siteName: SITE_CONFIG.siteName,
      title: SITE_CONFIG.title,
      description,
      url: absoluteUrl('/'),
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: SITE_CONFIG.siteName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      creator: SITE_CONFIG.socialHandle,
      title: SITE_CONFIG.title,
      description,
      images: [ogImage],
    },
  };
}

export default async function HomePage() {
  const homePost = await getHomePagePost();
  const content = homePost?.content || HOME_FALLBACK_CONTENT;
  const contentEn = homePost?.contentEn;

  return <HomePageView content={content} contentEn={contentEn} />;
}
