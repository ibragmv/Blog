import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Models to try in order of preference
const PRIMARY_MODEL = "gemini-2.0-flash";
const FALLBACK_MODEL = "gemini-1.5-flash";

export async function translateContent(text: string, targetLang: 'en' | 'ru' = 'en'): Promise<string> {
  if (!ai) {
    console.warn("Gemini API key not found. Please set VITE_GEMINI_API_KEY in your environment variables.");
    return text; // Return original text if no API key
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
  } catch (error: any) {
    console.warn(`Translation with ${PRIMARY_MODEL} failed, trying fallback...`, error);
    try {
      const response = await ai.models.generateContent({
        model: FALLBACK_MODEL,
        contents: prompt,
      });
      return response.text || text;
    } catch (fallbackError) {
      console.error("Translation failed with both models:", fallbackError);
      return text;
    }
  }
}

export async function translatePost(title: string, content: string): Promise<{ title_en: string, content_en: string }> {
  if (!ai) {
     console.warn("Gemini API key not found. Skipping translation.");
     return { title_en: title, content_en: content };
  }

  try {
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
    } catch (e) {
      console.warn(`Title translation with ${PRIMARY_MODEL} failed, trying fallback...`);
      const titleResponse = await ai.models.generateContent({
        model: FALLBACK_MODEL,
        contents: titlePrompt,
      });
      title_en = (titleResponse.text || title).trim().replace(/^"|"$/g, '');
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
    } catch (e) {
      console.warn(`Content translation with ${PRIMARY_MODEL} failed, trying fallback...`);
      const contentResponse = await ai.models.generateContent({
        model: FALLBACK_MODEL,
        contents: contentPrompt,
      });
      content_en = contentResponse.text || content;
    }

    return { title_en, content_en };
  } catch (error) {
    console.error("Translation process failed completely:", error);
    return { title_en: title, content_en: content };
  }
}
