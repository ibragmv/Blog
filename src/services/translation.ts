import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Models to try in order of preference
// gemini-2.0-flash often has strict quotas (limit: 0) on free tiers.
// gemini-1.5-flash is the most stable and generous for free tier usage.
const PRIMARY_MODEL = "gemini-1.5-flash";

export async function translateContent(text: string, targetLang: 'en' | 'ru' = 'en'): Promise<string> {
  if (!ai) {
    throw new Error("Gemini API key not found. Please set VITE_GEMINI_API_KEY in your Vercel environment variables.");
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
    console.error(`Translation with ${PRIMARY_MODEL} failed:`, error);
    
    // Handle specific error codes
    if (error.message?.includes('429') || error.status === 429) {
      throw new Error("Translation quota exceeded. Please wait a minute and try again.");
    }
    
    throw new Error(`Translation failed: ${error.message || "Unknown error"}`);
  }
}

export async function translatePost(title: string, content: string): Promise<{ title_en: string, content_en: string }> {
  if (!ai) {
     throw new Error("Gemini API key not found. Please set VITE_GEMINI_API_KEY in your Vercel environment variables.");
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
    } catch (e: any) {
      console.error("Title translation failed:", e);
      if (e.message?.includes('429') || e.status === 429) {
         throw new Error("Translation quota exceeded. Please wait a minute and try again.");
      }
      // For title, we can fallback to original if it's not a quota error
      title_en = title;
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
    } catch (e: any) {
      console.error("Content translation failed:", e);
      if (e.message?.includes('429') || e.status === 429) {
         throw new Error("Translation quota exceeded. Please wait a minute and try again.");
      }
      // For content, we can fallback to original if it's not a quota error
      content_en = content;
    }

    return { title_en, content_en };
  } catch (error: any) {
    console.error("Translation process failed completely:", error);
    throw new Error(error.message || "Translation failed");
  }
}
