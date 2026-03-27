import type { IncomingMessage, ServerResponse } from 'node:http';
import { queryConvex } from '../src/lib/server/convex-http';

type FeedPost = {
  title: string;
  slug: string;
  content: string;
  createdAt: number;
};

function getBaseUrl(req: IncomingMessage) {
  const forwardedProto = req.headers['x-forwarded-proto'];
  const forwardedHost = req.headers['x-forwarded-host'];
  const protocol = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto || 'https';
  const host = Array.isArray(forwardedHost)
    ? forwardedHost[0]
    : forwardedHost || req.headers.host || 'localhost';

  return host.includes('vercel.app') ? `https://${host}` : `${protocol}://${host}`;
}

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function buildExcerpt(content: string) {
  const text = content.replace(/[#*`]/g, '').replace(/\s+/g, ' ').trim();

  if (text.length <= 200) {
    return text;
  }

  return `${text.slice(0, 197).trim()}...`;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const posts = await queryConvex<FeedPost[]>('posts:listPublished', { limit: 20 });
    const baseUrl = getBaseUrl(req);
    const date = new Date().toUTCString();

    const items = posts.map((post) => {
      const link = `${baseUrl}/blog/${post.slug}`;
      const description = buildExcerpt(post.content || '');

      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${new Date(post.createdAt).toUTCString()}</pubDate>
      <description><![CDATA[${description}]]></description>
    </item>`;
    });

    const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<?xml-stylesheet type="text/xsl" href="/rss.xsl"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Ibragim Ibragimov</title>
    <link>${escapeXml(baseUrl)}</link>
    <description>Latest updates from Ibragim Ibragimov</description>
    <lastBuildDate>${date}</lastBuildDate>
    <language>en-us</language>
    <ttl>15</ttl>
    <image>
      <url>${baseUrl}/favicon.ico</url>
      <title>Ibragim Ibragimov</title>
      <link>${escapeXml(baseUrl)}</link>
    </image>
    <atom:link href="${escapeXml(`${baseUrl}/feed.xml`)}" rel="self" type="application/rss+xml" />
    ${items.join('')}
  </channel>
</rss>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300');
    res.statusCode = 200;
    res.end(rss);
  } catch (error) {
    console.error('Unexpected error generating RSS feed:', error);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
}
