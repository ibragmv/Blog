import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArchivePostView } from '@/components/archive-post-view';
import { ArchivePostLiveSync } from '@/components/public-live-sync';
import { PublicRealtimeProvider } from '@/components/public-realtime-provider';
import {
  getDefaultContentLanguage,
  getPrimaryPostContent,
  getPrimaryPostTitle,
  parseContentLanguage,
  resolveContentLanguage,
} from '@/lib/content';
import { buildDescription } from '@/lib/seo';
import { getPublishedPostBySlug, listPublishedPosts } from '@/lib/server/public-data';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
};

export async function generateStaticParams() {
  const posts = await listPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post not found',
      description: 'This article is no longer available.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = getPrimaryPostTitle(post);
  const description = buildDescription(getPrimaryPostContent(post));
  const ogImage = `/archive/${post.slug}/opengraph-image`;

  return {
    title,
    description,
    alternates: {
      canonical: `/archive/${post.slug}`,
    },
    openGraph: {
      type: 'article',
      title,
      description,
      url: `/archive/${post.slug}`,
      publishedTime: new Date(post.createdAt).toISOString(),
      modifiedTime: new Date(post.updatedAt).toISOString(),
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function ArchivePostPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const [{ lang }, post] = await Promise.all([searchParams, getPublishedPostBySlug(slug)]);

  if (!post) {
    notFound();
  }

  const defaultLanguage = getDefaultContentLanguage(post);
  const hasTranslation = !!post.titleEN && !!post.contentEN;
  const activeLanguage = resolveContentLanguage(
    parseContentLanguage(lang),
    defaultLanguage,
    hasTranslation
  );

  return (
    <>
      <PublicRealtimeProvider>
        <ArchivePostLiveSync initialPost={post} slug={slug} />
      </PublicRealtimeProvider>
      <ArchivePostView
        activeLanguage={activeLanguage}
        defaultLanguage={defaultLanguage}
        post={post}
      />
    </>
  );
}
