import { GoogleGenAI } from '@google/genai';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

// Initialize Gemini AI
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;

const translateSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

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

    return res.json({ title_en, content_en });
  } catch (error: unknown) {
    console.error('Translation error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: 'Translation failed', message });
  }
}
