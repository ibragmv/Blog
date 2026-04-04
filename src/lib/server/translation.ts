import { GoogleGenAI } from '@google/genai';
import type { TranslationPayload, TranslationResult } from '@/lib/translation';

type TranslationJob = {
  promptLabel: 'title' | 'content';
  responseKey: keyof TranslationResult;
  source?: string;
};

export class TranslationServiceUnavailableError extends Error {
  constructor(message = 'Translation service is unavailable.') {
    super(message);
    this.name = 'TranslationServiceUnavailableError';
  }
}

function buildPrompt(promptLabel: TranslationJob['promptLabel'], source: string) {
  if (promptLabel === 'title') {
    return `
Translate the following archive entry title from Russian to English.
Do not add any conversational text. Return only the translation.

Title: "${source}"
    `;
  }

  return `
Translate the following archive entry content from Russian to English.
Strictly preserve the Markdown formatting.
Do not translate code inside code blocks.
Do not add notes or explanations. Return only the translation.

Content:
${source}
  `;
}

function normalizeTranslation(
  promptLabel: TranslationJob['promptLabel'],
  source: string,
  output?: string
) {
  if (!output) {
    return source;
  }

  const normalizedOutput = promptLabel === 'title' ? output.trim().replace(/^"|"$/g, '') : output;
  return normalizedOutput || source;
}

async function runTranslationJob(
  client: GoogleGenAI,
  model: string,
  job: TranslationJob
): Promise<[TranslationJob['responseKey'], string | undefined]> {
  if (!job.source) {
    return [job.responseKey, undefined];
  }

  const response = await client.models.generateContent({
    model,
    contents: buildPrompt(job.promptLabel, job.source),
  });

  return [job.responseKey, normalizeTranslation(job.promptLabel, job.source, response.text)];
}

export async function translateArchiveEntry(
  payload: TranslationPayload
): Promise<TranslationResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new TranslationServiceUnavailableError();
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const client = new GoogleGenAI({ apiKey });
  const jobs: TranslationJob[] = [
    {
      promptLabel: 'title',
      responseKey: 'titleEN',
      source: payload.title,
    },
    {
      promptLabel: 'content',
      responseKey: 'contentEN',
      source: payload.content,
    },
  ];

  const results = await Promise.all(jobs.map((job) => runTranslationJob(client, model, job)));

  return Object.fromEntries(results) as TranslationResult;
}
