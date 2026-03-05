import { createClient } from '@supabase/supabase-js';
import type { IncomingMessage, ServerResponse } from 'http';

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

    const items = posts
      ?.map((post) => {
        const link = `${baseUrl}/blog/${post.slug}`;
        return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${new Date(post.created_at).toUTCString()}</pubDate>
      <description><![CDATA[${post.content ? post.content.slice(0, 200).replace(/#/g, '') + '...' : ''}]]></description>
      <author>ibragimirpost@gmail.com (Ibragim Ibragimov)</author>
    </item>`;
      })
      .join('');

    const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<?xml-stylesheet type="text/xsl" href="/rss.xsl"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Ibragim Ibragimov</title>
    <link>${baseUrl}</link>
    <description>Latest updates from Ibragim Ibragimov</description>
    <lastBuildDate>${date}</lastBuildDate>
    <language>en-us</language>
    <image>
      <url>${baseUrl}/logo.svg</url>
      <title>Ibragim Ibragimov</title>
      <link>${baseUrl}</link>
    </image>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    ${items}
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
