import { NextResponse } from 'next/server';
import { absoluteUrl, buildDescription } from '@/lib/seo';
import { getHomePagePost, getPublishedPosts } from '@/lib/server/data';
import { SITE_CONFIG } from '@/lib/site';

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export async function GET() {
  const [homePost, posts] = await Promise.all([getHomePagePost(), getPublishedPosts(20)]);
  const date = new Date().toUTCString();

  const items = posts.map((post) => {
    const link = absoluteUrl(`/blog/${post.slug}`);
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
    <title>${SITE_CONFIG.siteName}</title>
    <link>${escapeXml(absoluteUrl('/'))}</link>
    <description>${escapeXml(buildDescription(homePost?.summary, homePost?.content))}</description>
    <lastBuildDate>${date}</lastBuildDate>
    <language>en-us</language>
    <ttl>15</ttl>
    <image>
      <url>${absoluteUrl('/icon')}</url>
      <title>${SITE_CONFIG.siteName}</title>
      <link>${escapeXml(absoluteUrl('/'))}</link>
    </image>
    <atom:link href="${escapeXml(absoluteUrl('/feed.xml'))}" rel="self" type="application/rss+xml" />
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
