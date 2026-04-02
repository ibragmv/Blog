type TranslationResponse = {
  content_en?: string;
  error?: string;
  message?: string;
  title_en?: string;
};

async function readTranslationResponse(response: Response): Promise<TranslationResponse> {
  const data = (await response.json()) as TranslationResponse;

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Translation failed');
  }

  return data;
}

export async function translatePost(
  title: string,
  content: string
): Promise<{ title_en: string; content_en: string }> {
  const response = await fetch('/api/translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, content }),
  });

  const data = await readTranslationResponse(response);
  return {
    title_en: data.title_en || title,
    content_en: data.content_en || content,
  };
}
