import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { BlogPostView } from '@/components/blog-post-view';
import { getPreferredPostContent, getPreferredPostTitle } from '@/lib/content';
import { buildDescription } from '@/lib/seo';
import { getPublishedPostBySlug } from '@/lib/server/data';

type Props = {
  params: Promise<{ slug: string }>;
};

const getCachedPublishedPostBySlug = cache((slug: string) => getPublishedPostBySlug(slug));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getCachedPublishedPostBySlug(slug);

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

  const title = getPreferredPostTitle(post);
  const description = buildDescription(getPreferredPostContent(post));
  const ogImage = `/blog/${post.slug}/opengraph-image`;

  return {
    title,
    description,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      type: 'article',
      title,
      description,
      url: `/blog/${post.slug}`,
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

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getCachedPublishedPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return <BlogPostView post={post} />;
}
