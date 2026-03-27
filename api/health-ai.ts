import { GoogleGenAI } from '@google/genai';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;

export default async function handler(_req: VercelRequest, res: VercelResponse) {
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
}
