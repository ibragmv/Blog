import express from 'express';
import { createServer } from 'http';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';
// @ts-ignore
import ogHandler from './api/og';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Gemini AI
const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const genAI = apiKey
  ? new GoogleGenAI({ apiKey })
  : null;

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
    // Silent failure for missing env vars in dev to keep logs clean
  }

  const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseKey || 'placeholder'
  );

  // Translation Endpoint
  app.post('/api/translate', async (req, res) => {
    try {
      if (!genAI) {
        return res.status(500).json({ error: 'Gemini API key not configured on server' });
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
    } catch (error: any) {
      console.error('Translation error:', error);
      res.status(500).json({ error: 'Translation failed', message: error.message });
    }
  });

  // RSS Feed Endpoint
  app.get('/feed.xml', async (req, res) => {
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
        return res.status(500).send('Error generating RSS feed');
      }

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const date = new Date().toUTCString();

      const items = posts
        ?.map((post) => {
          const link = `${baseUrl}/blog/${post.slug}`;
          return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${link}</link>
      <guid>${link}</guid>
      <pubDate>${new Date(post.created_at).toUTCString()}</pubDate>
      <description><![CDATA[${post.content ? post.content.slice(0, 200) + '...' : ''}]]></description>
      <author>Ibragim Ibragimov</author>
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

      res.set('Content-Type', 'application/xml');
      res.send(rss);
    } catch (err) {
      console.error('Unexpected error generating RSS feed:', err);
      res.status(500).send('Internal Server Error');
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: {
          server: httpServer,
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));

    // Handle Blog Post OG Tags
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
        console.error('Error generating OG image:', e);
        res.status(500).send('Error generating OG image');
      }
    });

    app.get('/blog/:slug', async (req, res) => {
      try {
        const { slug } = req.params;
        const { data: post } = await supabase
          .from('posts')
          .select('title, content, created_at')
          .eq('slug', slug)
          .single();

        if (!post) {
          return res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
        }

        const indexPath = path.resolve(__dirname, 'dist', 'index.html');
        let html = await fs.promises.readFile(indexPath, 'utf-8');

        // Construct OG Image URL
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers['x-forwarded-host'] || req.headers.host;
        const baseUrl = `${protocol}://${host}`;
        
        const dateStr = new Date(post.created_at).toISOString().split('T')[0];
        const ogImageUrl = `${baseUrl}/api/og?title=${encodeURIComponent(post.title)}&date=${dateStr}`;
        const description = post.content 
          ? post.content.slice(0, 160).replace(/[#*`]/g, '').replace(/\n/g, ' ') + '...' 
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
        
        // Replace existing title if possible, otherwise just append to head
        html = html.replace('<title>Ibragim Ibragimov</title>', ''); 
        html = html.replace('</head>', `${metaTags}</head>`);
        
        res.send(html);
      } catch (e) {
        console.error('Error injecting OG tags:', e);
        // Fallback to standard SPA
        res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
      }
    });
    
    // SPA fallback
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
