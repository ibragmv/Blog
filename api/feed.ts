import { createClient } from '@supabase/supabase-js';
import type { IncomingMessage, ServerResponse } from 'http';
import { marked } from 'marked';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder'
);

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
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

    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    // Force production domain if on vercel to avoid http/https mismatches
    const baseUrl = host?.includes('vercel.app') ? `https://${host}` : `${protocol}://${host}`;
    
    const date = new Date().toUTCString();

    const items = await Promise.all(posts?.map(async (post) => {
      const link = `${baseUrl}/blog/${post.slug}`;
      const contentHtml = await marked.parse(post.content || '');
      // Strip HTML for description
      const description = contentHtml.replace(/<[^>]*>?/gm, '').slice(0, 200) + '...';

      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${link}</link>
      <guid isPermaLink="false">${post.id}</guid>
      <pubDate>${new Date(post.created_at).toUTCString()}</pubDate>
      <description><![CDATA[${description}]]></description>
      <content:encoded><![CDATA[${contentHtml}]]></content:encoded>
      <dc:creator>Ibragim Ibragimov</dc:creator>
    </item>`;
    }) || []);

    const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<?xml-stylesheet type="text/xsl" href="/rss.xsl"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Ibragim Ibragimov</title>
    <link>${baseUrl}</link>
    <description>Latest updates from Ibragim Ibragimov</description>
    <lastBuildDate>${date}</lastBuildDate>
    <language>en-us</language>
    <image>
      <url>${baseUrl}/favicon.ico</url>
      <title>Ibragim Ibragimov</title>
      <link>${baseUrl}</link>
    </image>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    ${items.join('')}
  </channel>
</rss>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
    res.statusCode = 200;
    res.end(rss);
  } catch (err) {
    console.error('Unexpected error generating RSS feed:', err);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
}
