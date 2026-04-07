import type { Metadata } from 'next';
import { HomePageView } from '@/components/home-page-view';
import { HomeLiveSync } from '@/components/public-live-sync';
import { PublicRealtimeProvider } from '@/components/public-realtime-provider';
import {
  getDefaultContentLanguage,
  parseContentLanguage,
  resolveContentLanguage,
} from '@/lib/content';
import { absoluteUrl, buildDescription } from '@/lib/seo';
import { getHomePagePost } from '@/lib/server/public-data';
import { SITE_CONFIG } from '@/lib/site';

export const revalidate = 60;

type HomePageProps = {
  searchParams: Promise<{ lang?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const homePost = await getHomePagePost();
  const description = buildDescription(homePost?.contentEN || homePost?.contentRU);
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

export default async function HomePage({ searchParams }: HomePageProps) {
  const [{ lang }, homePost] = await Promise.all([searchParams, getHomePagePost()]);
  const defaultLanguage = getDefaultContentLanguage(homePost);
  const hasTranslation = !!homePost?.contentEN;
  const activeLanguage = resolveContentLanguage(
    parseContentLanguage(lang),
    defaultLanguage,
    hasTranslation
  );

  return (
    <>
      <PublicRealtimeProvider>
        <HomeLiveSync initialPost={homePost} />
      </PublicRealtimeProvider>
      <HomePageView
        activeLanguage={activeLanguage}
        defaultLanguage={defaultLanguage}
        post={homePost}
      />
    </>
  );
}
