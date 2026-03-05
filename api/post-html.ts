import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder'
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query;

  if (!slug || typeof slug !== 'string') {
    return res.status(400).send('Missing slug');
  }

  try {
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const baseUrl = host?.includes('vercel.app') ? `https://${host}` : `${protocol}://${host}`;

    // Fetch the actual built index.html from the deployment
    // We use the baseUrl to fetch the root path, which Vercel serves as index.html
    const indexResponse = await fetch(`${baseUrl}/index.html`);
    
    if (!indexResponse.ok) {
      console.error(`Failed to fetch index.html: ${indexResponse.status}`);
      return res.status(500).send('Failed to load application');
    }

    let html = await indexResponse.text();

    const { data: post, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !post) {
      // If post not found, we still return the app so it can handle the 404
      // But we don't inject custom meta tags (or we could inject default ones)
      res.setHeader('Content-Type', 'text/html');
      return res.send(html);
    }

    const title = `${post.title} | Ibragim Ibragimov`;
    const description = post.content 
      ? post.content.slice(0, 160).replace(/[#*`]/g, '').trim() + '...'
      : 'Read this article on Ibragim Ibragimov\'s blog.';
    const image = `${baseUrl}/api/og?title=${encodeURIComponent(post.title)}`;
    const url = `${baseUrl}/blog/${slug}`;

    // Inject meta tags
    // We replace the default title and add meta tags to the head
    html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
    
    const metaTags = `
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="Ibragim Ibragimov" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:url" content="${url}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
    `;

    // Insert meta tags before </head>
    html = html.replace('</head>', `${metaTags}</head>`);

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    res.send(html);
  } catch (error) {
    console.error('Error serving post HTML:', error);
    res.status(500).send('Internal Server Error');
  }
}
