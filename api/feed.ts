import type { IncomingMessage, ServerResponse } from 'node:http';
import { createClient } from '@supabase/supabase-js';
import { marked } from 'marked';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder'
);

const SITE_TITLE = 'Ibragim Ibragimov';
const SITE_DESCRIPTION = 'Latest updates from Ibragim Ibragimov';
const SITE_AUTHOR = 'Ibragim Ibragimov';
const FEED_TTL_MINUTES = 15;

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

function buildExcerpt(html: string) {
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length <= 200) {
    return text;
  }

  return `${text.slice(0, 197).trim()}...`;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, slug, title, content, created_at')
      .eq('published', true)
      .neq('slug', 'home')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching posts for RSS:', error);
      res.statusCode = 500;
      res.end('Error generating RSS feed');
      return;
    }

    const baseUrl = getBaseUrl(req);
    const siteIconUrl = `${baseUrl}/favicon.ico`;
    const date = new Date().toUTCString();

    const items = await Promise.all(
      (posts || []).map(async (post) => {
        const link = `${baseUrl}/blog/${post.slug}`;
        const contentHtml = await marked.parse(post.content || '');
        const description = buildExcerpt(contentHtml);

        return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${new Date(post.created_at).toUTCString()}</pubDate>
      <description><![CDATA[${description}]]></description>
      <content:encoded><![CDATA[${contentHtml}]]></content:encoded>
      <dc:creator>${SITE_AUTHOR}</dc:creator>
    </item>`;
      })
    );

    const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<?xml-stylesheet type="text/xsl" href="/rss.xsl"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:webfeeds="http://webfeeds.org/rss/1.0">
  <channel>
    <title>${SITE_TITLE}</title>
    <link>${escapeXml(baseUrl)}</link>
    <description>${SITE_DESCRIPTION}</description>
    <lastBuildDate>${date}</lastBuildDate>
    <language>en-us</language>
    <ttl>${FEED_TTL_MINUTES}</ttl>
    <generator>Vercel</generator>
    <image>
      <url>${siteIconUrl}</url>
      <title>${SITE_TITLE}</title>
      <link>${escapeXml(baseUrl)}</link>
    </image>
    <webfeeds:icon>${siteIconUrl}</webfeeds:icon>
    <webfeeds:accentColor>f97316</webfeeds:accentColor>
    <atom:link href="${escapeXml(`${baseUrl}/feed.xml`)}" rel="self" type="application/rss+xml" />
    ${items.join('')}
  </channel>
</rss>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300');
    res.statusCode = 200;
    res.end(rss);
  } catch (err) {
    console.error('Unexpected error generating RSS feed:', err);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
}
