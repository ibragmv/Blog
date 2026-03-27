import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Gemini API key is missing on the server.',
      },
      { status: 503 }
    );
  }

  const _client = new GoogleGenAI({ apiKey });

  return NextResponse.json({
    status: 'ok',
    message: 'Server is connected to Gemini API.',
  });
}
