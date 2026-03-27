type GeneratePostSummaryInput = {
  title: string;
  content: string;
  slug?: string;
};

export async function generatePostSummary({
  title,
  content,
  slug,
}: GeneratePostSummaryInput): Promise<string> {
  const response = await fetch('/api/summary', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, content, slug }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || 'Summary generation failed');
  }

  const data = await response.json();
  return typeof data.summary === 'string' ? data.summary : '';
}
