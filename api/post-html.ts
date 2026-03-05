import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder'
);

const htmlTemplate = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/logo.svg" />
    <link rel="alternate icon" href="/favicon.ico" />
    <link rel="mask-icon" href="/logo.svg" color="#f97316" />
    <link rel="alternate" type="application/rss+xml" title="Ibragim Ibragimov" href="/feed.xml" />
    <meta name="theme-color" content="#f97316" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{TITLE}}</title>
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="Ibragim Ibragimov" />
    <meta property="og:title" content="{{TITLE}}" />
    <meta property="og:description" content="{{DESCRIPTION}}" />
    <meta property="og:image" content="{{IMAGE}}" />
    <meta property="og:url" content="{{URL}}" />

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:title" content="{{TITLE}}" />
    <meta property="twitter:description" content="{{DESCRIPTION}}" />
    <meta property="twitter:image" content="{{IMAGE}}" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query;

  if (!slug || typeof slug !== 'string') {
    return res.status(400).send('Missing slug');
  }

  try {
    const { data: post, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !post) {
      // Fallback to default index.html if post not found (let client handle 404)
      return res.redirect('/');
    }

    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const baseUrl = host?.includes('vercel.app') ? `https://${host}` : `${protocol}://${host}`;
    
    const title = `${post.title} | Ibragim Ibragimov`;
    const description = post.content 
      ? post.content.slice(0, 160).replace(/[#*`]/g, '').trim() + '...'
      : 'Read this article on Ibragim Ibragimov\'s blog.';
    const image = `${baseUrl}/api/og?title=${encodeURIComponent(post.title)}`;
    const url = `${baseUrl}/blog/${slug}`;

    const html = htmlTemplate
      .replace(/{{TITLE}}/g, title)
      .replace(/{{DESCRIPTION}}/g, description)
      .replace(/{{IMAGE}}/g, image)
      .replace(/{{URL}}/g, url);

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    res.send(html);
  } catch (error) {
    console.error('Error serving post HTML:', error);
    res.status(500).send('Internal Server Error');
  }
}
