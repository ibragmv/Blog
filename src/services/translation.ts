import { GoogleGenAI } from "@google/genai";

const getEnvVar = (key: string) => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return undefined;
};

const apiKey = getEnvVar('GEMINI_API_KEY') || import.meta.env.VITE_GEMINI_API_KEY;

// Debug logging to help troubleshoot Vercel deployments
if (!apiKey) {
  console.warn("Gemini API Key is missing! Check VITE_GEMINI_API_KEY in Vercel settings.");
} else {
  console.log("Gemini API Key found (starts with):", apiKey.substring(0, 8) + "...");
}

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Models to try in order of preference
// gemini-1.5-flash is deprecated/prohibited (returns 404).
// gemini-2.0-flash returns 429 (quota exceeded).
// gemini-3-flash-preview is the recommended model for text tasks.
const PRIMARY_MODEL = "gemini-3-flash-preview";

export async function testConnection(): Promise<{ success: boolean; message: string }> {
  if (!ai) {
    return { success: false, message: "API Key is missing. Please check VITE_GEMINI_API_KEY." };
  }
  try {
    const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: "Hello",
    });
    return { success: true, message: `Connection successful! Response: ${response.text?.substring(0, 20)}...` };
  } catch (error: any) {
    console.error("Connection test failed:", error);
    if (error.message?.includes('404') || error.status === 404) {
      return { success: false, message: `Model ${PRIMARY_MODEL} not found (404). API Key might be invalid for this model.` };
    }
    return { success: false, message: error.message || "Unknown connection error" };
  }
}

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
    if (error.message?.includes('404') || error.status === 404) {
      throw new Error(`Model ${PRIMARY_MODEL} not found. Please check API configuration.`);
    }
    
    throw new Error(`Translation failed: ${error.message || "Unknown error"}`);
  }
}

export async function translatePost(title: string, content: string): Promise<{ title_en: string, content_en: string }> {
  if (!ai) {
     throw new Error("Gemini API key not found. Please set VITE_GEMINI_API_KEY in your Vercel environment variables.");
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
  } catch (e: any) {
    console.error("Title translation failed:", e);
    throw new Error(`Title translation failed: ${e.message || "Unknown error"}`);
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
    throw new Error(`Content translation failed: ${e.message || "Unknown error"}`);
  }

  return { title_en, content_en };
}
