import fs from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import { consola } from 'consola';
import dotenv from 'dotenv';
import express from 'express';
import type { ViteDevServer } from 'vite';
import { z } from 'zod';
import ogHandler from './api/og';

// Manually load .env to control logging
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '.env');
let envCount = 0;

if (fs.existsSync(envPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
    envCount++;
  }
}

// Initialize Gemini AI
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;

const translateSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
});

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const PORT = 3000;

  app.set('trust proxy', true);
  app.use(express.json());

  // Initialize Supabase client
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    consola.warn('Supabase credentials missing in environment variables');
  }

  const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseKey || 'placeholder'
  );

  // Health Check for AI
  app.get('/api/health-ai', async (_req, res) => {
    if (!genAI) {
      return res.status(503).json({
        status: 'error',
        message: 'Gemini API key is missing on the server.',
      });
    }

    return res.json({
      status: 'ok',
      message: 'Server is connected to Gemini API.',
    });
  });

  // Translation Endpoint
  app.post('/api/translate', async (req, res) => {
    try {
      if (!genAI) {
        return res.status(503).json({ error: 'Gemini API key not configured on server' });
      }

      const result = translateSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: 'Invalid request data', details: result.error });
      }

      const { title, content } = result.data;
      const model = 'gemini-3-flash-preview';

      let title_en = title;
      let content_en = content;

      if (title) {
        const titlePrompt = `
          Translate the following blog post title from Russian to English.
          Do not add any conversational text. Just the translation.
          
          Title: "${title}"
        `;
        const response = await genAI.models.generateContent({
          model,
          contents: titlePrompt,
        });
        if (response.text) {
          title_en = response.text.trim().replace(/^"|"$/g, '');
        }
      }

      if (content) {
        const contentPrompt = `
          Translate the following blog post content from Russian to English.
          Strictly preserve the Markdown formatting (headings, lists, code blocks, bold, italic, links, etc.).
          Do not translate code inside code blocks.
          Do not add any conversational text, explanations, or notes. Just the translation.
          
          Content:
          ${content}
        `;
        const response = await genAI.models.generateContent({
          model,
          contents: contentPrompt,
        });
        if (response.text) {
          content_en = response.text;
        }
      }

      res.json({ title_en, content_en });
    } catch (error: unknown) {
      consola.error('Translation error:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: 'Translation failed', message });
    }
  });

  // RSS Feed Endpoint
  app.get('/feed.xml', async (req, res) => {
    try {
      const { data: posts, error } = await supabase
        .from('posts')
        .select('id, slug, title, content, created_at')
        .eq('published', true)
        .neq('slug', 'home')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        consola.error('Error fetching posts for RSS:', error);
        return res.status(500).send('Error generating RSS feed');
      }

      // Determine Base URL
      const protocol = req.headers['x-forwarded-proto'] || 'https';
      const host = req.headers['x-forwarded-host'] || req.headers.host;
      // Force production domain if on vercel to avoid http/https mismatches
      const baseUrl = host?.includes('vercel.app') ? `https://${host}` : `${protocol}://${host}`;

      const date = new Date().toUTCString();

      const items = posts
        ?.map((post) => {
          const link = `${baseUrl}/blog/${post.slug}`;
          const description = post.content
            ? post.content.slice(0, 200).replace(/[#*`]/g, '').replace(/\s+/g, ' ').trim()
            : '';

          return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${new Date(post.created_at).toUTCString()}</pubDate>
      <description><![CDATA[${description}${description.length >= 200 ? '...' : ''}]]></description>
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
    <ttl>15</ttl>
    <image>
      <url>${baseUrl}/favicon.ico</url>
      <title>Ibragim Ibragimov</title>
      <link>${baseUrl}</link>
    </image>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

      res.set('Content-Type', 'application/xml');
      res.send(rss);
    } catch (err) {
      consola.error('Unexpected error generating RSS feed:', err);
      res.status(500).send('Internal Server Error');
    }
  });

  // Handle Blog Post OG Tags - Available in both Dev and Prod
  app.get('/api/og', async (req, res) => {
    try {
      const protocol = req.headers['x-forwarded-proto'] || 'https';
      const host = req.headers['x-forwarded-host'] || req.headers.host;
      const url = `${protocol}://${host}${req.url}`;

      const request = new Request(url);
      const response = await ogHandler(request);

      response.headers.forEach((value: string, key: string) => {
        res.setHeader(key, value);
      });

      const arrayBuffer = await response.arrayBuffer();
      res.status(response.status).send(Buffer.from(arrayBuffer));
    } catch (e) {
      consola.error('Error generating OG image:', e);
      res.status(500).send('Error generating OG image');
    }
  });

  let vite: ViteDevServer | undefined;
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server: httpServer,
        },
      },
      appType: 'custom',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist'), { index: false }));
  }

  // Handle Blog Post with OG Tags
  app.get('/blog/:slug', async (req, res, next) => {
    try {
      const { slug } = req.params;
      const { data: post } = await supabase
        .from('posts')
        .select('title, content, created_at')
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (!post) {
        let missingHtml = '';
        if (process.env.NODE_ENV !== 'production') {
          const template = await fs.promises.readFile(
            path.resolve(__dirname, 'index.html'),
            'utf-8'
          );
          missingHtml = await vite.transformIndexHtml(req.originalUrl, template);
        } else {
          missingHtml = await fs.promises.readFile(
            path.resolve(__dirname, 'dist', 'index.html'),
            'utf-8'
          );
        }

        const missingMeta = `
        <title>Post not found | Ibragim Ibragimov</title>
        <meta name="description" content="This article is no longer available." />
        <meta name="robots" content="noindex" />
        `;

        missingHtml = missingHtml.replace('<title>Ibragim Ibragimov</title>', '');
        missingHtml = missingHtml.replace('</head>', `${missingMeta}</head>`);

        return res.status(404).send(missingHtml);
      }

      const protocol = req.headers['x-forwarded-proto'] || 'https';
      const host = req.headers['x-forwarded-host'] || req.headers.host;
      const baseUrl = host?.includes('vercel.app') ? `https://${host}` : `${protocol}://${host}`;

      const dateStr = new Date(post.created_at).toISOString().split('T')[0];
      const ogImageUrl = `${baseUrl}/api/og?title=${encodeURIComponent(post.title)}`;
      const description = post.content
        ? `${post.content.slice(0, 160).replace(/[#*`]/g, '').replace(/\n/g, ' ')}...`
        : '';

      // Inject meta tags
      const metaTags = `
        <title>${post.title} | Ibragim Ibragimov</title>
        <meta name="description" content="${description}" />
        <meta property="og:title" content="${post.title}" />
        <meta property="og:description" content="${description}" />
        <meta property="og:image" content="${ogImageUrl}" />
        <meta property="og:url" content="${baseUrl}/blog/${slug}" />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${post.title}" />
        <meta name="twitter:description" content="${description}" />
        <meta name="twitter:image" content="${ogImageUrl}" />
      `;

      void dateStr;
      let html = '';
      if (process.env.NODE_ENV !== 'production') {
        const template = await fs.promises.readFile(path.resolve(__dirname, 'index.html'), 'utf-8');
        html = (await vite?.transformIndexHtml(req.originalUrl, template)) ?? template;
      } else {
        html = await fs.promises.readFile(path.resolve(__dirname, 'dist', 'index.html'), 'utf-8');
      }

      html = html.replace('<title>Ibragim Ibragimov</title>', '');
      html = html.replace('</head>', `${metaTags}</head>`);

      res.send(html);
    } catch (e) {
      consola.error('Error injecting OG tags:', e);
      next();
    }
  });

  // Handle Root Route with Default OG Tags
  app.get('/', async (req, res, next) => {
    try {
      const protocol = req.headers['x-forwarded-proto'] || 'https';
      const host = req.headers['x-forwarded-host'] || req.headers.host;
      const baseUrl = host?.includes('vercel.app') ? `https://${host}` : `${protocol}://${host}`;

      const ogImageUrl = `${baseUrl}/api/og`;
      const title = 'Ibragim Ibragimov';
      const description = 'Can a robot write a symphony?';

      // Inject meta tags
      const metaTags = `
        <title>${title}</title>
        <meta name="description" content="${description}" />
        <meta property="og:title" content="${title}" />
        <meta property="og:description" content="${description}" />
        <meta property="og:image" content="${ogImageUrl}" />
        <meta property="og:url" content="${baseUrl}" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${title}" />
        <meta name="twitter:description" content="${description}" />
        <meta name="twitter:image" content="${ogImageUrl}" />
      `;

      let html = '';
      if (process.env.NODE_ENV !== 'production') {
        const template = await fs.promises.readFile(path.resolve(__dirname, 'index.html'), 'utf-8');
        html = (await vite?.transformIndexHtml(req.originalUrl, template)) ?? template;
      } else {
        html = await fs.promises.readFile(path.resolve(__dirname, 'dist', 'index.html'), 'utf-8');
      }

      html = html.replace('<title>Ibragim Ibragimov</title>', '');
      html = html.replace('</head>', `${metaTags}</head>`);

      res.send(html);
    } catch (e) {
      consola.error('Error injecting OG tags for root:', e);
      next();
    }
  });

  // SPA fallback
  app.use('*', async (req, res) => {
    try {
      const url = req.originalUrl;
      let html = '';
      if (process.env.NODE_ENV !== 'production') {
        const template = await fs.promises.readFile(path.resolve(__dirname, 'index.html'), 'utf-8');
        html = await vite.transformIndexHtml(url, template);
      } else {
        html = await fs.promises.readFile(path.resolve(__dirname, 'dist', 'index.html'), 'utf-8');
      }
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (error: unknown) {
      consola.error(error);
      const message = error instanceof Error ? error.message : 'Internal Server Error';
      res.status(500).end(message);
    }
  });

  httpServer.listen(PORT, '0.0.0.0', () => {
    consola.success(`Server running on http://localhost:${PORT}`);
    consola.info(`Loaded ${envCount} environment variables from .env`);
  });
}

startServer();
