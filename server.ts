import fs from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';
import { consola } from 'consola';
import dotenv from 'dotenv';
import express, { type Request, type Response } from 'express';
import type { ViteDevServer } from 'vite';
import { z } from 'zod';
import ogHandler from './api/og';
import {
  ADMIN_SESSION_COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE_MS,
  api,
  createAdminSessionToken,
  createConvexHttpClient,
  hashAdminSessionToken,
} from './src/lib/server/convex';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPaths = [path.resolve(__dirname, '.env')];
let envCount = 0;

for (const envPath of envPaths) {
  if (!fs.existsSync(envPath)) {
    continue;
  }

  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  for (const key in envConfig) {
    process.env[key] = envConfig[key];
    envCount++;
  }
}

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;

const translateSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
});

const adminLoginSchema = z.object({
  email: z.string().trim().min(1),
  password: z.string().min(1),
});

function getBaseUrl(req: Request) {
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

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function buildExcerpt(content: string) {
  const text = content.replace(/[#*`]/g, '').replace(/\s+/g, ' ').trim();

  if (text.length <= 200) {
    return text;
  }

  return `${text.slice(0, 197).trim()}...`;
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

function parseCookies(cookieHeader?: string) {
  if (!cookieHeader) {
    return {};
  }

  return Object.fromEntries(
    cookieHeader
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const separatorIndex = part.indexOf('=');

        if (separatorIndex === -1) {
          return [part, ''];
        }

        return [part.slice(0, separatorIndex), decodeURIComponent(part.slice(separatorIndex + 1))];
      })
  );
}

function readAdminSessionToken(req: Request) {
  return parseCookies(req.headers.cookie)[ADMIN_SESSION_COOKIE_NAME] || null;
}

function setAdminSessionCookie(res: Response, sessionToken: string) {
  res.cookie(ADMIN_SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ADMIN_SESSION_MAX_AGE_MS,
  });
}

function clearAdminSessionCookie(res: Response) {
  res.clearCookie(ADMIN_SESSION_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
}

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const PORT = Number(process.env.PORT || 3000);

  app.set('trust proxy', true);
  app.use(express.json());

  let convex: ReturnType<typeof createConvexHttpClient> | null = null;

  try {
    convex = createConvexHttpClient();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    consola.warn(`Convex is not configured yet: ${message}`);
  }

  const getConvexOrThrow = () => {
    if (!convex) {
      throw new Error('Convex is not configured. Set VITE_CONVEX_URL or CONVEX_URL.');
    }

    return convex;
  };

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

  app.get('/api/admin/session', async (req, res) => {
    try {
      const sessionToken = readAdminSessionToken(req);

      if (!sessionToken) {
        clearAdminSessionCookie(res);
        return res.json({
          authenticated: false,
          email: null,
          sessionToken: null,
        });
      }

      const tokenHash = hashAdminSessionToken(sessionToken);
      const session = await getConvexOrThrow().query(api.sessions.getByTokenHash, {
        tokenHash,
      });

      if (!session || session.expiresAt <= Date.now()) {
        await getConvexOrThrow().mutation(api.sessions.removeByTokenHash, { tokenHash });
        clearAdminSessionCookie(res);
        return res.json({
          authenticated: false,
          email: null,
          sessionToken: null,
        });
      }

      return res.json({
        authenticated: true,
        email: session.email,
        sessionToken,
      });
    } catch (error) {
      consola.error('Failed to restore admin session:', error);
      clearAdminSessionCookie(res);
      return res.status(500).json({ error: 'Failed to restore admin session.' });
    }
  });

  app.post('/api/admin/session', async (req, res) => {
    try {
      const parsed = adminLoginSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid login payload.' });
      }

      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPassword = process.env.ADMIN_PASSWORD;

      if (!adminEmail || !adminPassword) {
        return res.status(503).json({
          error: 'ADMIN_EMAIL and ADMIN_PASSWORD must be configured on the server.',
        });
      }

      if (parsed.data.email !== adminEmail || parsed.data.password !== adminPassword) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const sessionToken = createAdminSessionToken();
      const tokenHash = hashAdminSessionToken(sessionToken);

      await getConvexOrThrow().mutation(api.sessions.create, {
        tokenHash,
        email: adminEmail,
        expiresAt: Date.now() + ADMIN_SESSION_MAX_AGE_MS,
      });

      setAdminSessionCookie(res, sessionToken);

      return res.json({
        authenticated: true,
        email: adminEmail,
        sessionToken,
      });
    } catch (error) {
      consola.error('Failed to create admin session:', error);
      return res.status(500).json({ error: 'Failed to create admin session.' });
    }
  });

  app.delete('/api/admin/session', async (req, res) => {
    try {
      const sessionToken = readAdminSessionToken(req);

      if (sessionToken) {
        await getConvexOrThrow().mutation(api.sessions.removeByTokenHash, {
          tokenHash: hashAdminSessionToken(sessionToken),
        });
      }
    } catch (error) {
      consola.error('Failed to remove admin session:', error);
    } finally {
      clearAdminSessionCookie(res);
    }

    return res.json({
      authenticated: false,
      email: null,
      sessionToken: null,
    });
  });

  app.get('/feed.xml', async (req, res) => {
    try {
      const posts = await getConvexOrThrow().query(api.posts.listPublished, { limit: 20 });
      const baseUrl = getBaseUrl(req);
      const siteIconUrl = `${baseUrl}/favicon.ico`;
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
      <dc:creator>Ibragim Ibragimov</dc:creator>
    </item>`;
      });

      const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<?xml-stylesheet type="text/xsl" href="/rss.xsl"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Ibragim Ibragimov</title>
    <link>${escapeXml(baseUrl)}</link>
    <description>Latest updates from Ibragim Ibragimov</description>
    <lastBuildDate>${date}</lastBuildDate>
    <language>en-us</language>
    <ttl>15</ttl>
    <image>
      <url>${siteIconUrl}</url>
      <title>Ibragim Ibragimov</title>
      <link>${escapeXml(baseUrl)}</link>
    </image>
    <atom:link href="${escapeXml(`${baseUrl}/feed.xml`)}" rel="self" type="application/rss+xml" />
    ${items.join('')}
  </channel>
</rss>`;

      res.set('Content-Type', 'application/xml');
      res.send(rss);
    } catch (error) {
      consola.error('Unexpected error generating RSS feed:', error);
      res.status(500).send('Internal Server Error');
    }
  });

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
    } catch (error) {
      consola.error('Error generating OG image:', error);
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

  app.get('/blog/:slug', async (req, res, next) => {
    try {
      const post = await getConvexOrThrow().query(api.posts.getPublishedBySlug, {
        slug: req.params.slug,
      });

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

      const baseUrl = getBaseUrl(req);
      const ogImageUrl = `${baseUrl}/api/og?title=${encodeURIComponent(post.title)}`;
      const description = buildDescription(post.content);

      const metaTags = `
        <title>${post.title} | Ibragim Ibragimov</title>
        <meta name="description" content="${escapeHtml(description)}" />
        <meta property="og:title" content="${escapeHtml(post.title)}" />
        <meta property="og:description" content="${escapeHtml(description)}" />
        <meta property="og:image" content="${escapeHtml(ogImageUrl)}" />
        <meta property="og:url" content="${escapeHtml(`${baseUrl}/blog/${post.slug}`)}" />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${escapeHtml(post.title)}" />
        <meta name="twitter:description" content="${escapeHtml(description)}" />
        <meta name="twitter:image" content="${escapeHtml(ogImageUrl)}" />
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
    } catch (error) {
      consola.error('Error injecting OG tags:', error);
      next();
    }
  });

  app.get('/', async (req, res, next) => {
    try {
      const baseUrl = getBaseUrl(req);
      const ogImageUrl = `${baseUrl}/api/og`;
      const title = 'Ibragim Ibragimov';
      const description = 'Can a robot write a symphony?';

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
    } catch (error) {
      consola.error('Error injecting OG tags for root:', error);
      next();
    }
  });

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
