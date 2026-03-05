import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const genAI = apiKey
  ? new GoogleGenAI({ apiKey })
  : null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!genAI) {
    return res.status(503).json({ 
      status: 'error', 
      message: 'Gemini API key is missing on the server.' 
    });
  }
  
  return res.json({ 
    status: 'ok', 
    message: 'Server is connected to Gemini API.' 
  });
}
