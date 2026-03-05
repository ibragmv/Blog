export async function testConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch('/api/health-ai');

    if (!response.ok) {
      const data = await response.json();
      return {
        success: false,
        message: data.message || `Server error: ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: data.message || 'Successfully connected to server-side AI.',
    };
  } catch (error) {
    console.error('Connection test failed:', error);
    return {
      success: false,
      message: 'Network error: Could not reach the server.',
    };
  }
}

export async function translateContent(
  text: string,
  _targetLang: 'en' | 'ru' = 'en'
): Promise<string> {
  if (!text || text.trim() === '') return '';

  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: text }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Translation failed');
    }

    const data = await response.json();
    return data.content_en || text;
  } catch (error: unknown) {
    console.error('Translation failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Translation failed: ${errorMessage}`);
  }
}

export async function translatePost(
  title: string,
  content: string
): Promise<{ title_en: string; content_en: string }> {
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Translation failed');
    }

    const data = await response.json();
    return {
      title_en: data.title_en || title,
      content_en: data.content_en || content,
    };
  } catch (error: unknown) {
    console.error('Translation failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Translation failed: ${errorMessage}`);
  }
}
