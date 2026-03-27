import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const summarySchema = z.object({
  title: z.string(),
  content: z.string(),
  slug: z.string().optional(),
});

function normalizeSummary(summary: string) {
  return summary.replace(/\s+/g, ' ').trim().replace(/^"|"$/g, '').slice(0, 220);
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Gemini API key not configured on server' }, { status: 503 });
  }

  const payload = summarySchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
  }

  try {
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const client = new GoogleGenAI({ apiKey });
    const { title, content, slug } = payload.data;
    const response = await client.models.generateContent({
      model,
      contents: `
Create a concise summary for link preview metadata of this page.

Requirements:
- Use the same language as the source content.
- Return one short paragraph suitable for meta description and social preview text.
- Target 140-180 characters, and never exceed 220 characters.
- Do not use quotes, markdown, emojis, labels, or introductory phrases.
- Write from the author's perspective, as if the author personally wrote this short description.
- Prefer first-person voice when it sounds natural in the source language.
- Do not describe the author in third person.
- Do not write phrases like "this blog is about", "the author writes about", or "Ibragim explains".
- Focus on the substance of the page, not on the implementation details of the site.

Page slug: ${slug || 'post'}
Title: ${title}

Markdown content:
${content}
      `,
    });

    const summary = normalizeSummary(response.text || '');

    if (!summary) {
      return NextResponse.json(
        { error: 'Summary generation returned empty text' },
        { status: 502 }
      );
    }

    return NextResponse.json({ summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Summary generation failed', message }, { status: 500 });
  }
}
