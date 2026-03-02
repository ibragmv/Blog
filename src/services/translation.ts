import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function translateContent(text: string, targetLang: 'en' | 'ru' = 'en'): Promise<string> {
  if (!ai) {
    console.warn("Gemini API key not found. Translation skipped.");
    return text; // Return original text if no API key
  }

  if (!text || text.trim() === '') return '';

  try {
    const prompt = `
      Translate the following text from Russian to English.
      Strictly preserve the Markdown formatting. Do not change code blocks, links, or any other Markdown syntax.
      Do not add any conversational text, explanations, or notes. Just the translation.
      
      Text to translate:
      ${text}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || text;
  } catch (error) {
    console.error("Translation error:", error);
    return text; // Fallback to original text on error
  }
}

export async function translatePost(title: string, content: string): Promise<{ title_en: string, content_en: string }> {
  if (!ai) {
     return { title_en: title, content_en: content };
  }

  try {
    // Translate Title
    const titlePrompt = `
      Translate the following blog post title from Russian to English.
      Do not add any conversational text. Just the translation.
      
      Title: "${title}"
    `;
    const titleResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: titlePrompt,
    });
    const title_en = (titleResponse.text || title).trim().replace(/^"|"$/g, ''); // Remove quotes if added

    // Translate Content
    const contentPrompt = `
      Translate the following blog post content from Russian to English.
      Strictly preserve the Markdown formatting (headings, lists, code blocks, bold, italic, links, etc.).
      Do not translate code inside code blocks.
      Do not add any conversational text, explanations, or notes. Just the translation.
      
      Content:
      ${content}
    `;
    const contentResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contentPrompt,
    });
    const content_en = contentResponse.text || content;

    return { title_en, content_en };
  } catch (error) {
    console.error("Translation failed:", error);
    return { title_en: title, content_en: content };
  }
}
