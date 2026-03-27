import type { VercelRequest, VercelResponse } from '@vercel/node';
import { api, createConvexHttpClient } from '../src/lib/server/convex';

function getBaseUrl(req: VercelRequest) {
  const forwardedProto = req.headers['x-forwarded-proto'];
  const forwardedHost = req.headers['x-forwarded-host'];
  const protocol = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto || 'https';
  const host = Array.isArray(forwardedHost)
    ? forwardedHost[0]
    : forwardedHost || req.headers.host || 'localhost';

  return host.includes('vercel.app') ? `https://${host}` : `${protocol}://${host}`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function buildDescription(content?: string | null) {
  const text = (content || '').replace(/[#*`]/g, '').replace(/\s+/g, ' ').trim();

  if (!text) {
    return "Read this article on Ibragim Ibragimov's blog.";
  }

  if (text.length <= 160) {
    return text;
  }

  return `${text.slice(0, 157).trim()}...`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query;

  if (!slug || typeof slug !== 'string') {
    return res.status(404).send('Post not found');
  }

  try {
    const convex = createConvexHttpClient();
    const baseUrl = getBaseUrl(req);
    const post = await convex.query(api.posts.getPublishedBySlug, { slug });

    const indexResponse = await fetch(`${baseUrl}/index.html`);

    if (!indexResponse.ok) {
      console.error(`Failed to fetch index.html: ${indexResponse.status}`);
      return res.status(500).send('Failed to load application');
    }

    let html = await indexResponse.text();

    if (!post) {
      const notFoundTitle = 'Post not found | Ibragim Ibragimov';
      const notFoundDescription = 'This article is no longer available.';
      const notFoundMeta = `
    <title>${notFoundTitle}</title>
    <meta name="description" content="${notFoundDescription}" />
    <meta name="robots" content="noindex" />
    <meta property="og:title" content="${notFoundTitle}" />
    <meta property="og:description" content="${notFoundDescription}" />
    <meta property="og:url" content="${escapeHtml(`${baseUrl}/blog/${slug}`)}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${notFoundTitle}" />
    <meta name="twitter:description" content="${notFoundDescription}" />
    `;

      html = html.replace(/<title>.*?<\/title>/, '');
      html = html.replace('</head>', `${notFoundMeta}</head>`);

      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Cache-Control', 'no-store');
      return res.status(404).send(html);
    }

    const title = `${post.title} | Ibragim Ibragimov`;
    const description = buildDescription(post.content);
    const image = `${baseUrl}/api/og?title=${encodeURIComponent(post.title)}`;
    const url = `${baseUrl}/blog/${slug}`;

    html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);

    const metaTags = `
    <meta name="description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="Ibragim Ibragimov" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta property="og:url" content="${escapeHtml(url)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(image)}" />
    `;

    html = html.replace('</head>', `${metaTags}</head>`);

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    res.send(html);
  } catch (error) {
    console.error('Error serving post HTML:', error);
    res.status(500).send('Internal Server Error');
  }
}
