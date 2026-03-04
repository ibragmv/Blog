import { GoogleGenAI } from '@google/genai';

const getEnvVar = (key: string) => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return undefined;
};

const apiKey = getEnvVar('GEMINI_API_KEY') || import.meta.env.VITE_GEMINI_API_KEY;

// Debug logging removed to clean up dev output
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const PRIMARY_MODEL = 'gemini-3-flash-preview';

export async function testConnection(): Promise<{ success: boolean; message: string }> {
  if (!ai) {
    return { success: false, message: 'API Key is missing. Please check VITE_GEMINI_API_KEY.' };
  }
  try {
    const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: 'Hello',
    });
    return {
      success: true,
      message: `Connection successful! Response: ${response.text?.substring(0, 20)}...`,
    };
  } catch (error: unknown) {
    console.error('Connection test failed:', error);
    const err = error as { message?: string; status?: number };
    if (err.message?.includes('404') || err.status === 404) {
      return {
        success: false,
        message: `Model ${PRIMARY_MODEL} not found (404). API Key might be invalid for this model.`,
      };
    }
    return { success: false, message: err.message || 'Unknown connection error' };
  }
}

export async function translateContent(
  text: string,
  _targetLang: 'en' | 'ru' = 'en'
): Promise<string> {
  if (!ai) {
    throw new Error(
      'Gemini API key not found. Please set VITE_GEMINI_API_KEY in your Vercel environment variables.'
    );
  }

  if (!text || text.trim() === '') return '';

  const prompt = `
    Translate the following text from Russian to English.
    Strictly preserve the Markdown formatting. Do not change code blocks, links, or any other Markdown syntax.
    Do not add any conversational text, explanations, or notes. Just the translation.
    
    Text to translate:
    ${text}
  `;

  try {
    const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: prompt,
    });
    return response.text || text;
  } catch (error: unknown) {
    console.error(`Translation with ${PRIMARY_MODEL} failed:`, error);
    const err = error as { message?: string; status?: number };

    // Handle specific error codes
    if (err.message?.includes('429') || err.status === 429) {
      throw new Error('Translation quota exceeded. Please wait a minute and try again.');
    }
    if (err.message?.includes('404') || err.status === 404) {
      throw new Error(`Model ${PRIMARY_MODEL} not found. Please check API configuration.`);
    }

    throw new Error(`Translation failed: ${err.message || 'Unknown error'}`);
  }
}

export async function translatePost(
  title: string,
  content: string
): Promise<{ title_en: string; content_en: string }> {
  if (!ai) {
    throw new Error(
      'Gemini API key not found. Please set VITE_GEMINI_API_KEY in your Vercel environment variables.'
    );
  }

  // Translate Title
  const titlePrompt = `
    Translate the following blog post title from Russian to English.
    Do not add any conversational text. Just the translation.
    
    Title: "${title}"
  `;

  let title_en = title;
  try {
    const titleResponse = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: titlePrompt,
    });
    title_en = (titleResponse.text || title).trim().replace(/^"|"$/g, '');
  } catch (e: unknown) {
    console.error('Title translation failed:', e);
    const err = e as { message?: string };
    throw new Error(`Title translation failed: ${err.message || 'Unknown error'}`);
  }

  // Translate Content
  const contentPrompt = `
    Translate the following blog post content from Russian to English.
    Strictly preserve the Markdown formatting (headings, lists, code blocks, bold, italic, links, etc.).
    Do not translate code inside code blocks.
    Do not add any conversational text, explanations, or notes. Just the translation.
    
    Content:
    ${content}
  `;

  let content_en = content;
  try {
    const contentResponse = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: contentPrompt,
    });
    content_en = contentResponse.text || content;
  } catch (e: unknown) {
    console.error('Content translation failed:', e);
    const err = e as { message?: string };
    throw new Error(`Content translation failed: ${err.message || 'Unknown error'}`);
  }

  return { title_en, content_en };
}
