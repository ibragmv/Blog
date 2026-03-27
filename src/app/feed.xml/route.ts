import { NextResponse } from 'next/server';
import { buildFeedTitle, escapeXml, RSS_ICON_PATH, RSS_REVALIDATE_SECONDS } from '@/lib/rss';
import { buildDescription } from '@/lib/seo';
import { getHomePagePost, getPublishedPosts } from '@/lib/server/data';

export const revalidate = 300;

function absoluteUrl(path: string, origin: string) {
  return new URL(path, origin).toString();
}

export async function GET(request: Request) {
  const [homePost, posts] = await Promise.all([
    getHomePagePost({ next: { revalidate: RSS_REVALIDATE_SECONDS } }),
    getPublishedPosts(20, { next: { revalidate: RSS_REVALIDATE_SECONDS } }),
  ]);
  const origin = new URL(request.url).origin;
  const lastBuildDate =
    posts.length > 0
      ? new Date(Math.max(...posts.map((post) => post.updatedAt || post.createdAt))).toUTCString()
      : new Date().toUTCString();

  const items = posts.map((post) => {
    const link = absoluteUrl(`/blog/${post.slug}`, origin);
    const description = buildDescription(post.summary, post.content, '');

    return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${new Date(post.createdAt).toUTCString()}</pubDate>
      <description><![CDATA[${description.slice(0, 200)}]]></description>
    </item>`;
  });

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<?xml-stylesheet type="text/xsl" href="/rss.xsl"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${buildFeedTitle()}</title>
    <link>${escapeXml(absoluteUrl('/', origin))}</link>
    <description>${escapeXml(buildDescription(homePost?.summary, homePost?.content))}</description>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <language>en-us</language>
    <ttl>15</ttl>
    <image>
      <url>${escapeXml(absoluteUrl(RSS_ICON_PATH, origin))}</url>
      <title>${buildFeedTitle()}</title>
      <link>${escapeXml(absoluteUrl('/', origin))}</link>
    </image>
    <atom:link href="${escapeXml(absoluteUrl('/feed.xml', origin))}" rel="self" type="application/rss+xml" />
    ${items.join('')}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}
