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
    const [title_en, content_en] = await Promise.all([
      title
        ? client.models
            .generateContent({
              model,
              contents: `
Translate the following archive entry title from Russian to English.
Do not add any conversational text. Just the translation.

Title: "${title}"
              `,
            })
            .then((response) => response.text?.trim().replace(/^"|"$/g, '') || title)
        : Promise.resolve(title),
      content
        ? client.models
            .generateContent({
              model,
              contents: `
Translate the following archive entry content from Russian to English.
Strictly preserve the Markdown formatting.
Do not translate code inside code blocks.
Do not add notes or explanations. Return translation only.

Content:
${content}
              `,
            })
            .then((response) => response.text || content)
        : Promise.resolve(content),
    ]);

    return NextResponse.json({ title_en, content_en });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Translation failed', message }, { status: 500 });
  }
}
