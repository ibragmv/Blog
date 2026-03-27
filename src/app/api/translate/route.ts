import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const translateSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
});

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Gemini API key not configured on server' }, { status: 503 });
  }

  const payload = translateSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
  }

  try {
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const client = new GoogleGenAI({ apiKey });
    const { title, content } = payload.data;

    let title_en = title;
    let content_en = content;

    if (title) {
      const response = await client.models.generateContent({
        model,
        contents: `
Translate the following blog post title from Russian to English.
Do not add any conversational text. Just the translation.

Title: "${title}"
        `,
      });

      if (response.text) {
        title_en = response.text.trim().replace(/^"|"$/g, '');
      }
    }

    if (content) {
      const response = await client.models.generateContent({
        model,
        contents: `
Translate the following blog post content from Russian to English.
Strictly preserve the Markdown formatting.
Do not translate code inside code blocks.
Do not add notes or explanations. Return translation only.

Content:
${content}
        `,
      });

      if (response.text) {
        content_en = response.text;
      }
    }

    return NextResponse.json({ title_en, content_en });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Translation failed', message }, { status: 500 });
  }
}
